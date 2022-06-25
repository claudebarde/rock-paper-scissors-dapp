import type BigNumber from "bignumber.js";

export type UserResults = {
  won: { amount: BigNumber; total: BigNumber };
  lost: BigNumber;
  last_game: { player: BigNumber; contract: BigNumber } | null;
  wins_in_a_row: BigNumber;
};

export type UserChoice = "rock" | "paper" | "scissors";
