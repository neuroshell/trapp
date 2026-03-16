import {
  validateRunningForm,
  validateStrengthForm,
  validateTimestamp,
  calculatePace,
  formatPace,
  isOutlier,
} from "../src/validation";

describe("Validation Functions", () => {
  describe("validateRunningForm", () => {
    it("should return valid for proper running data", () => {
      const result = validateRunningForm({
        distance: "5.0",
        duration: "30",
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should reject empty distance", () => {
      const result = validateRunningForm({
        distance: "",
        duration: "30",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.distance).toContain("distance");
    });

    it("should reject negative distance", () => {
      const result = validateRunningForm({
        distance: "-5",
        duration: "30",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.distance).toContain("valid distance");
    });

    it("should reject distance over 100km", () => {
      const result = validateRunningForm({
        distance: "150",
        duration: "30",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.distance).toContain("0-100 km");
    });

    it("should reject empty duration", () => {
      const result = validateRunningForm({
        distance: "5.0",
        duration: "",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.duration).toContain("duration");
    });

    it("should reject duration over 1440 minutes", () => {
      const result = validateRunningForm({
        distance: "5.0",
        duration: "2000",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.duration).toContain("0-1440 min");
    });

    it("should accept decimal distances", () => {
      const result = validateRunningForm({
        distance: "5.5",
        duration: "30",
      });

      expect(result.valid).toBe(true);
    });
  });

  describe("validateStrengthForm", () => {
    it("should return valid for proper strength data", () => {
      const result = validateStrengthForm({
        reps: "20",
        sets: "3",
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should reject empty reps", () => {
      const result = validateStrengthForm({
        reps: "",
        sets: "3",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.reps).toContain("reps");
    });

    it("should reject reps over 1000", () => {
      const result = validateStrengthForm({
        reps: "1500",
        sets: "3",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.reps).toContain("1-1000");
    });

    it("should reject empty sets", () => {
      const result = validateStrengthForm({
        reps: "20",
        sets: "",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.sets).toContain("sets");
    });

    it("should reject sets over 100", () => {
      const result = validateStrengthForm({
        reps: "20",
        sets: "150",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.sets).toContain("1-100");
    });

    it("should accept optional weight", () => {
      const result = validateStrengthForm({
        reps: "20",
        sets: "3",
        weight: "50",
      });

      expect(result.valid).toBe(true);
    });

    it("should reject negative weight", () => {
      const result = validateStrengthForm({
        reps: "20",
        sets: "3",
        weight: "-10",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.weight).toContain("valid weight");
    });

    it("should reject weight over 500kg", () => {
      const result = validateStrengthForm({
        reps: "20",
        sets: "3",
        weight: "600",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.weight).toContain("0-500 kg");
    });
  });

  describe("validateTimestamp", () => {
    it("should return valid for past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const result = validateTimestamp(pastDate.toISOString());

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should return valid for current time", () => {
      const now = new Date();
      const result = validateTimestamp(now.toISOString());

      expect(result.valid).toBe(true);
    });

    it("should reject future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const result = validateTimestamp(futureDate.toISOString());

      expect(result.valid).toBe(false);
      expect(result.errors.timestamp).toContain("future");
    });
  });

  describe("calculatePace", () => {
    it("should calculate correct pace", () => {
      const pace = calculatePace(10, 60); // 10km in 60min = 6:00 min/km
      expect(pace).toBe(6);
    });

    it("should return 0 for invalid distance", () => {
      const pace = calculatePace(0, 30);
      expect(pace).toBe(0);
    });

    it("should return 0 for invalid duration", () => {
      const pace = calculatePace(5, 0);
      expect(pace).toBe(0);
    });
  });

  describe("formatPace", () => {
    it("should format pace as MM:SS min/km", () => {
      expect(formatPace(6)).toBe("6:00 min/km");
      expect(formatPace(5.5)).toBe("5:30 min/km");
      expect(formatPace(4.333)).toBe("4:20 min/km");
    });

    it("should return placeholder for invalid pace", () => {
      expect(formatPace(0)).toBe("--:-- min/km");
      expect(formatPace(-1)).toBe("--:-- min/km");
    });
  });

  describe("isOutlier", () => {
    it("should detect unusual distance", () => {
      expect(isOutlier("distance", 60)).toBe(true);
      expect(isOutlier("distance", 30)).toBe(false);
    });

    it("should detect unusual duration", () => {
      expect(isOutlier("duration", 200)).toBe(true);
      expect(isOutlier("duration", 120)).toBe(false);
    });

    it("should detect unusual reps", () => {
      expect(isOutlier("reps", 600)).toBe(true);
      expect(isOutlier("reps", 100)).toBe(false);
    });

    it("should detect unusual sets", () => {
      expect(isOutlier("sets", 60)).toBe(true);
      expect(isOutlier("sets", 20)).toBe(false);
    });

    it("should detect unusual weight", () => {
      expect(isOutlier("weight", 250)).toBe(true);
      expect(isOutlier("weight", 100)).toBe(false);
    });
  });
});
