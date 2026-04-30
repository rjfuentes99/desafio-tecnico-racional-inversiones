import { describe, it, expect } from "vitest";
import { normalize } from "../normalize";

describe("normalize", () => {
  it("normaliza array con campo evolution", () => {
    const input = {
      evolution: [
        { date: "2024-01-15", value: 10000 },
        { date: "2024-01-16", value: 10500 },
      ],
    };
    const result = normalize(input);
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(10000);
    expect(result[0].date).toBeInstanceOf(Date);
  });

  it("convierte Firestore Timestamp", () => {
    const mockTimestamp = { toDate: () => new Date("2024-01-15") };
    const input = { evolution: [{ date: mockTimestamp, value: 10000 }] };
    const result = normalize(input);
    expect(result[0].date.toISOString()).toContain("2024-01-15");
  });

  it("convierte epoch en segundos", () => {
    const input = { evolution: [{ date: 1705276800, value: 10000 }] };
    const result = normalize(input);
    expect(result[0].date.getFullYear()).toBe(2024);
  });

  it("filtra valores inválidos", () => {
    const input = {
      evolution: [
        { date: "2024-01-15", value: 10000 },
        { date: null, value: 5000 },
        { date: "2024-01-16", value: NaN },
        { date: "invalid", value: 3000 },
      ],
    };
    const result = normalize(input);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(10000);
  });

  it("ordena por fecha ascendente", () => {
    const input = {
      evolution: [
        { date: "2024-01-20", value: 12000 },
        { date: "2024-01-15", value: 10000 },
        { date: "2024-01-18", value: 11000 },
      ],
    };
    const result = normalize(input);
    expect(result[0].value).toBe(10000);
    expect(result[1].value).toBe(11000);
    expect(result[2].value).toBe(12000);
  });

  it("retorna array vacío si no hay datos válidos", () => {
    expect(normalize({})).toEqual([]);
    expect(normalize({ evolution: [] })).toEqual([]);
    expect(normalize({ random: "data" })).toEqual([]);
  });

  it("acepta múltiples alias de campo", () => {
    const value = 10000;
    const date = "2024-01-15";
    expect(normalize({ evolution: [{ date, value }] })).toHaveLength(1);
    expect(normalize({ points: [{ date, value }] })).toHaveLength(1);
    expect(normalize({ history: [{ date, value }] })).toHaveLength(1);
    expect(normalize({ data: [{ date, value }] })).toHaveLength(1);
  });

  it("acepta formato de objeto values", () => {
    const input = {
      values: {
        "2024-01-15": 10000,
        "2024-01-16": 10500,
      },
    };
    const result = normalize(input);
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(10000);
  });

  it("decora con label, time e iso", () => {
    const input = { evolution: [{ date: "2024-01-15T14:30:00Z", value: 10000 }] };
    const result = normalize(input);
    expect(result[0].label).toBeTruthy();
    expect(result[0].time).toBeTruthy();
    expect(result[0].iso).toBeTruthy();
  });
});
