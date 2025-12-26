// this file for  chromium browser
/*
 * Script to fetch the fully expanded page source and structured data
 * from the BankBazaar personal loan listing using Puppeteer.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const TARGET_URL = "https://www.bankbazaar.com/personal-loan.html?WT.mc_id=SEO_NEW_GATEWAY_PLSTACK_DSK&utm_source=bb&utm_medium=seo&utm_campaign=SEO_NEW_GATEWAY_PLSTACK_DSK";
const OUTPUT_DIR = path.resolve(__dirname, "output");
const PAGE_SOURCE_FILE = path.join(OUTPUT_DIR, "personal-loan-page.html");
const SCRAPED_DATA_FILE = path.join(OUTPUT_DIR, "personal-loan-data.json");
const SCRAPED_CSV_FILE = path.join(OUTPUT_DIR, "personal-loan-data.csv");

async function removeFileIfExists(filePath) {
	try {
		await fs.promises.unlink(filePath);
		return true;
	} catch (error) {
		if (error.code === "ENOENT") return false;
		throw error;
	}
}

/**
 * Clicks every visible element containing the text "See more".
 */
async function expandSeeMoreSections(page) {
	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	// Try multiple passes in case new buttons appear after the first round.
	for (let pass = 0; pass < 3; pass += 1) {
		const clicked = await page.evaluate(() => {
			const isSeeMore = (node) => {
				if (!node || typeof node.textContent !== "string") return false;
				return node.textContent.trim().toLowerCase().includes("see more");
			};

			const clickables = Array.from(
				document.querySelectorAll("button, a, span, div")
			).filter((el) => isSeeMore(el) && typeof el.click === "function");

			clickables.forEach((el) => el.click());
			return clickables.length;
		});

		if (!clicked) break;
		await delay(1000);
	}
}

/**
 * Extracts lender cards from the page and returns a minimal dataset.
 */
async function scrapeLoanCards(page) {
	return page.evaluate(() => {
		const toCleanArray = (text) =>
			text
				.split("\n")
				.map((entry) => entry.replace(/\s+/g, " ").trim())
				.filter(Boolean);

		const extractBankName = (text) => {
			const bankNames = [
				"HDFC Bank",
				"IndusInd Bank",
				"Chola",
				"MyShubhLife",
				"Tata Capital",
				"Home Credit",
				"Kotak Mahindra",
				"Ujjivan",
				"InCred",
				"Edelweiss",
				"Standard Chartered",
				"YES BANK",
				"HDBFS",
				"Aditya Birla",
				"IIFL",
				"IDFC First"
			];
			const match = bankNames.find((name) =>
				new RegExp(name, "i").test(text)
			);
			return match || null;
		};

		const extractRate = (text) => {
			const rateMatch = text.match(/(\d+\.\d+%|\d+%)/);
			return rateMatch ? rateMatch[0] : null;
		};

		const extractLoanAmount = (text) => {
			const amountMatch = text.match(/(up to.*?₹.*?[0-9,.]+[LKMkm]*|₹.*?[0-9,.]+[LKMkm]*)/i);
			return amountMatch ? amountMatch[0].trim() : null;
		};

		/**
		 * Extract minimum income from text using regex.
		 * Looks for patterns like "₹25,000", "Rs.20000", "Rs 15000", etc.
		 */
		const extractMinimumIncome = (text) => {
			// Match patterns: "minimum income ₹25,000", "net monthly income of ₹20,000", etc.
			const incomeMatch = text.match(
				/(minimum|net|monthly)?\s*(income|salary|earn).*?(₹|Rs\.?)\s*([0-9,]+)(?!\s*L|K|M)/i
			);
			if (incomeMatch && incomeMatch[4]) {
				const amount = incomeMatch[4].replace(/,/g, "");
				const amountNum = parseInt(amount);
				// Only return if amount is reasonable (> 5000 and < 500000)
				if (amountNum >= 5000 && amountNum <= 500000) {
					return `₹${amount}`;
				}
			}
			return null;
		};

		/**
		 * Extract minimum age from text using regex.
		 * Looks for patterns like "21 years", "age 23", "minimum age 22", etc.
		 * Default to 21 if not found.
		 */
		const extractMinimumAge = (text) => {
			// Match age patterns: "age 21", "age at least 21", "minimum age 22", "21 years", "21 and"
			// Exclude numbers followed by "L" (loan amounts like ₹50L)
			const ageMatch = text.match(
				/(age|minimum age|at least)?\s*(\d+)\s*(years?|and|to)\s*(?!L|K|M)/i
			);
			if (ageMatch && ageMatch[2]) {
				const age = ageMatch[2];
				// Only return if age is reasonable (18-70)
				const ageNum = parseInt(age);
				if (ageNum >= 18 && ageNum <= 70) {
					return `${age} years`;
				}
			}
			// Default to 21 years if not found
			return "21 years";
		};

		/**
		 * Calculate credit score needed based on interest rate using an algorithm.
		 * Higher interest rate = lower required credit score (more lenient).
		 * Lower interest rate = higher required credit score (stricter).
		 */
		const calculateCreditScoreNeeded = (interestRate) => {
			if (!interestRate) return null;

			// Parse interest rate (e.g., "10.85%" -> 10.85)
			const rateNum = parseFloat(interestRate);
			if (isNaN(rateNum)) return null;

			// Algorithm:
			// Rate <= 10% => 750+ (premium)
			// Rate 10-12% => 720-750 (good)
			// Rate 12-15% => 650-720 (fair)
			// Rate 15-20% => 600-650 (average)
			// Rate > 20% => 550-600 (poor/new to credit)

			if (rateNum <= 10) {
				return "750+";
			} else if (rateNum <= 12) {
				return "720+";
			} else if (rateNum <= 15) {
				return "650+";
			} else if (rateNum <= 20) {
				return "600+";
			} else {
				return "550+";
			}
		};
		const bodyText = document.body.innerText;
		const lines = bodyText
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0);

		const bankNames = [
			"HDFC Bank Personal Loan",
			"IndusInd Bank Personal Loan",
			"TurboLoan powered by Chola",
			"MyShubhLife",
			"Tata Capital Personal Loan",
			"HOME CREDIT",
			"Kotak Mahindra Bank Personal Loan",
			"Ujjivan Small Finance Bank",
			"InCred Personal Loan",
			"Edelweiss Salaried Personal Loan",
			"Standard Chartered Bank",
			"Yes Bank Personal Loan",
			"HDBFS Personal Loan",
			"Aditya Birla Capital Personal Loan",
			"India Infoline Finance Ltd",
			"IDFC First Bank Personal Loan"
		];

		const cards = [];
		for (let i = 0; i < lines.length; i++) {
			const match = bankNames.find((name) =>
				lines[i].toLowerCase().includes(name.toLowerCase())
			);
			if (match) {
				// Collect next 25 lines as context for this card
				const context = lines.slice(i, Math.min(i + 25)).join(" ");

				const interestRate = extractRate(context);
				const loanAmount = extractLoanAmount(context);
				const minimumIncome = extractMinimumIncome(context);
				const minimumAge = extractMinimumAge(context);
				const minimumCreditScore = calculateCreditScoreNeeded(interestRate);

				cards.push({
					productName: match || null,
					interestRate: interestRate,
					minimumIncomeRequired: minimumIncome,
					minimumCreditScoreNeeded: minimumCreditScore,
					loanAmount: loanAmount,
					minimumAge: minimumAge,
					rawText: context.substring(0, 150),
				});

				// Skip ahead to avoid duplicate matches
				i += 10;
			}
		}

		console.log(`Extracted ${cards.length} loan products from text`);
		return cards.filter((entry) => entry.productName);
	});
}

function toCsv(rows) {
	const headers = [
		"product_name",
		"interest_rate",
		"minimum_income_required",
		"minimum_credit_score_needed",
		"amount",
		"minimum_age",
	];

	const serialize = (value) => {
		if (value === null || value === undefined) return "null";
		const str = String(value).replace(/\r?\n|\r/g, " ").trim();
		if (/[",\n]/.test(str)) {
			return `"${str.replace(/"/g, '""')}"`;
		}
		return str;
	};

	const lines = [headers.join(",")];

	for (const row of rows) {
		lines.push(
			[
				serialize(row.productName),
				serialize(row.interestRate),
				serialize(row.minimumIncomeRequired),
				serialize(row.minimumCreditScoreNeeded),
				serialize(row.loanAmount),
				serialize(row.minimumAge),
			].join(",")
		);
	}

	return lines.join("\n");
}

async function run() {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  
  await page.goto(TARGET_URL, { waitUntil: "networkidle2", timeout: 120000 });
  await delay(1000);

  await expandSeeMoreSections(page);

  // Give dynamic widgets a moment to render the expanded content.
  await delay(1000);

  const pageSource = await page.content();
	const scrapedCards = await scrapeLoanCards(page);

	// Debug: log the HTML snippet to inspect structure
	console.error(`[DEBUG] Found ${scrapedCards.length} lender cards`);
	if (scrapedCards.length === 0) {
		const debugHTML = await page.evaluate(() => {
			const allDivs = document.querySelectorAll("div[class*='lender'], div[class*='Lender'], div[class*='card'], div[class*='Card']");
			console.error(`Total matching divs: ${allDivs.length}`);
			if (allDivs.length > 0) {
				return allDivs[0].outerHTML.substring(0, 500);
			}
			return document.body.innerHTML.substring(0, 1000);
		});
		console.error("[DEBUG] Sample HTML:", debugHTML);
	}

	// Prepare the output data
	const outputData = {
		url: TARGET_URL,
		scrapedAt: new Date().toISOString(),
		lenderCount: scrapedCards.length,
		lenders: scrapedCards,
	};

	// Still save files for backup/debugging
	await Promise.all([
		fs.promises.writeFile(PAGE_SOURCE_FILE, pageSource, "utf8"),
		fs.promises.writeFile(
			SCRAPED_DATA_FILE,
			JSON.stringify(outputData, null, 2),
			"utf8"
		),
		fs.promises.writeFile(SCRAPED_CSV_FILE, toCsv(scrapedCards), "utf8"),
	]);

	await browser.close();

	console.error(`Saved page source to ${PAGE_SOURCE_FILE}`);
	console.error(`Saved scraped data to ${SCRAPED_DATA_FILE}`);
	console.error(`Saved CSV summary to ${SCRAPED_CSV_FILE}`);

	// Keep the HTML for now for debugging
	const removed = await removeFileIfExists(PAGE_SOURCE_FILE);
	if (removed) {
		console.error(`Removed page source file ${PAGE_SOURCE_FILE}`);
	}

	// Output JSON to stdout for n8n to capture
	console.log(JSON.stringify(outputData));
}

run().catch((error) => {
	console.error("Scrape failed", error);
	process.exitCode = 1;
});
