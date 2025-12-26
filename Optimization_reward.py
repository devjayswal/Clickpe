def predict_score_rule_based(income, credit_score, employment_status, age):
    # --- 1. Define Normalization Range (based on assumptions/domain knowledge) ---
    MIN_INCOME, MAX_INCOME = 30000, 150000
    MIN_CREDIT, MAX_CREDIT = 600, 850

    # --- 2. Feature Normalization and Value Assignment ---

    # Normalize Income (I_norm): Max value is 100
    i_norm = max(0, min(100, ((income - MIN_INCOME) / (MAX_INCOME - MIN_INCOME)) * 100))

    # Normalize Credit Score (C_norm): Max value is 100
    c_norm = max(0, min(100, ((credit_score - MIN_CREDIT) / (MAX_CREDIT - MIN_CREDIT)) * 100))

    # Employment Status Value (E_val)
    e_val = 1.0 if employment_status.lower() == 'salaried' else 0.8

    # --- 3. Age Multiplier (A_mult) ---
    if age < 21:
        # Penalize young age: linear decrease towards 0
        a_mult = (age / 21) * 0.5
    elif 21 <= age <= 65:
        # Increase from 21, peak around 45, decrease towards 65 (bell-shape approx)
        a_mult = 1.0 - (1.0 / 44) * abs(age - 45)
    else: # age > 65
        # Penalize older age: linear decrease from 65
        a_mult = max(0, 1.0 - (age - 65) / 10)

    # --- 4. Final Score Calculation (Weighted Sum) ---

    # Weights: Credit Score (50%) | Income (25%) | Employment (15%)
    # Age factor (10%) is contextualized by the Credit Score (C_norm)

    # The sum of explicit weights is 0.25 + 0.50 + 0.15 = 0.90
    # The age factor accounts for the remaining 0.10 contextually.

    final_score = (
        (0.25 * i_norm) +
        (0.50 * c_norm) +
        (0.15 * e_val * 100) + # E_val is 0.8 or 1.0, so multiply by 100
        (0.10 * a_mult * c_norm) # Age factor
    )

    return round(final_score, 2)

# --- Example Usage on your data ---
# Row 1: Dhruv Iyengar, 131000, 725, Self-Employed, 37
score1 = predict_score_rule_based(131000, 725, 'Self-Employed', 37)
print(f"Dhruv Iyengar's Score: {score1}")

# Row 5: Ishaan Trivedi, 35000, 800, Salaried, 34
score2 = predict_score_rule_based(35000, 800, 'Salaried', 34)
print(f"Ishaan Trivedi's Score: {score2}")