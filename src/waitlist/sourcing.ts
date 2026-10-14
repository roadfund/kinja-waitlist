export const sourcingValues = ["FARMERS", "COOPERATIVES", "TRADERS", "PROCESSORS", "MIXED", "NOT_YET"] as const;
export type Sourcing = (typeof sourcingValues)[number];

export const sourcingChoices = [
  ["FARMERS", "Straight from farmers"],
  ["COOPERATIVES", "Through cooperatives"],
  ["TRADERS", "From traders or aggregators"],
  ["PROCESSORS", "From processors"],
  ["MIXED", "A mix of these"],
  ["NOT_YET", "Not sourcing yet"],
] as const satisfies ReadonlyArray<readonly [Sourcing, string]>;

export function sourcingLabel(value: Sourcing): string {
  const match = sourcingChoices.find(([id]) => id === value);
  return match ? match[1] : value;
}
