import type BigNumber from "bignumber.js";

export type UserResults = {
  won: { amount: BigNumber; total: BigNumber };
  lost: BigNumber;
  last_game: { player: BigNumber; contract: BigNumber } | null;
};

export type UserChoice = "rock" | "paper" | "scissors";
