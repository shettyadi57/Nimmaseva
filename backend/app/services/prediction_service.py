def calculate_tatkal_probability(
    current_queue_size: int,
    server_status: str,
    avg_processing_mins: int,
    is_priority: bool,
    booking_type: str,
    time_of_day_hour: int = 10
) -> dict:
    """
    AI-inspired Tatkal prediction engine.
    Calculates probability (0-100%) of service completion today.
    """
    base_probability = 95.0

    # 1. Server Status Impact
    if server_status == "Down":
        return {"probability": 5, "level": "Low", "reason": "Server is currently DOWN"}
    elif server_status == "Maintenance":
        return {"probability": 25, "level": "Low", "reason": "Server undergoing maintenance"}
    elif server_status == "Busy":
        base_probability -= 15.0

    # 2. Queue Size Impact
    if current_queue_size > 40:
        base_probability -= 35.0
    elif current_queue_size > 25:
        base_probability -= 20.0
    elif current_queue_size > 10:
        base_probability -= 10.0

    # 3. Processing Complexity Impact
    if avg_processing_mins > 30:
        base_probability -= 15.0
    elif avg_processing_mins > 20:
        base_probability -= 8.0

    # 4. Priority Boost
    if is_priority:
        base_probability += 15.0

    # 5. Time of Day Impact (close to 5 PM decreases prob)
    if time_of_day_hour >= 15:  # After 3 PM
        base_probability -= 20.0
    elif time_of_day_hour >= 13: # After 1 PM
        base_probability -= 10.0

    prob = max(10, min(99, int(base_probability)))

    if prob >= 85:
        level = "Very High"
    elif prob >= 65:
        level = "High"
    elif prob >= 45:
        level = "Medium"
    else:
        level = "Low"

    return {
        "probability": prob,
        "level": level,
        "reason": f"Queue length ({current_queue_size}), Server ({server_status}), Priority ({is_priority})"
    }
