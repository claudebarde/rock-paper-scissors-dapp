<script lang="ts">
  import { onMount } from "svelte";
  import { TezosToolkit, ContractAbstraction, Wallet } from "@taquito/taquito";
  import { BeaconWallet } from "@taquito/beacon-wallet";
  import BigNumber from "bignumber.js";
  import type { UserResults, UserChoice } from "./types";
  import type { RockPaperScissorsWalletType } from "./ts-types/rock-paper-scissors.types";
  import type { address } from "./ts-types/type-aliases";
  import config from "./config";
  import RockImg from "./assets/rock-b.png";
  import PaperImg from "./assets/paper-b.png";
  import ScissorsImg from "./assets/scissors-b.png";
  import WalletDisplay from "./lib/Wallet.svelte";
  import ResultToast from "./lib/ResultToast.svelte";
  import MVP from "./lib/MVP.svelte";

  const NETWORK: "mainnet" | "testnet" = "mainnet";
  const CONTRACT_ADDRESS = config.contractAddress[NETWORK];
  const RPC_URL = config.rpcUrl[NETWORK];
  const correspondences = {
    rock: 1,
    paper: 2,
    scissors: 3
  };
  const reverse_correspondences = {
    1: "Rock",
    2: "Paper",
    3: "Scissors"
  };

  let Tezos: TezosToolkit;
  let contract: ContractAbstraction<Wallet>;
  let storage: Storage;
  let wallet: BeaconWallet;
  let walletOptions = {
    name: "Rock Paper Scissors",
    preferredNetwork: NETWORK === "testnet" ? "ithacanet" : "mainnet"
  };
  let userAddress: string;
  let userBalance: number;
  let userChoice: UserChoice;
  let userResults: UserResults;
  let playing = false;
  let gameResult = true;
  let resultText = "";
  let showGameResult = false;

  const updateUserData = async () => {
    Tezos.setWalletProvider(wallet);
    // finds user's address
    userAddress = await wallet.getPKH();
    // finds user's balance
    const balance = await Tezos.tz.getBalance(userAddress);
    if (balance) {
      userBalance = balance.toNumber();
    } else {
      userBalance = 0;
    }
    // loads current user's results
    const results = await storage.players.get(userAddress as address);
    if (results) {
      userResults = results;
    } else {
      userResults = {
        won: { amount: new BigNumber(0), total: new BigNumber(0) },
        lost: new BigNumber(0),
        last_game: null,
        wins_in_a_row: new BigNumber(0)
      };
    }
  };

  const connectWallet = async () => {
    if (wallet === undefined) {
      wallet = new BeaconWallet(walletOptions as any);
    }

    try {
      await wallet.requestPermissions({
        network: {
          type: NETWORK === "testnet" ? "ithacanet" : ("mainnet" as any),
          rpcUrl: RPC_URL
        }
      });
      await updateUserData();
    } catch (error) {
      console.error(error);
      userAddress = "";
      userBalance = 0;
    }
  };

  const disconnectWallet = async () => {
    userAddress = "";
    userBalance = 0;
    userChoice = undefined;
    await wallet.client.removeAllAccounts();
  };

  const convertUserChoice = (val: UserChoice): number => {
    if (correspondences.hasOwnProperty(val)) {
      return correspondences[val];
    } else {
      throw `Unexpected user choice: ${val}`;
    }
  };

  const play = async () => {
    if (userChoice) {
      playing = true;
      try {
        const op = await contract.methods
          .play(convertUserChoice(userChoice))
          .send({
            amount: storage.prize.plus(storage.play_fee).toNumber(),
            mutez: true
          });
        await op.confirmation();
        // refreshes the storage
        storage = await contract.storage();
        // fetches the new user results
        const results: UserResults | undefined = await storage.players.get(
          userAddress as address
        );
        if (!results) {
          throw "Unexpected empty player's results";
        }
        // finds if player won or lost
        const contractChoice = results.last_game.contract.toNumber();
        if (
          results.won.amount.isGreaterThan(userResults.won.amount) &&
          results.lost.isEqualTo(userResults.lost)
        ) {
          // player won
          gameResult = true;

          resultText = `Congratulations! The contract played ${reverse_correspondences[contractChoice]}, you won!`;
        } else if (
          results.lost.isGreaterThan(userResults.lost) &&
          results.won.amount.isEqualTo(userResults.won.amount)
        ) {
          // player lost
          gameResult = false;

          resultText = `Sorry, the contract played ${reverse_correspondences[contractChoice]}, you lost!`;
        } else {
          const opStatus = await op.status();
          gameResult = false;
          if (opStatus === "unknown") {
            resultText = "An unknown error occured";
          } else if (opStatus === "applied") {
            resultText = "Operation was applied and confirmed";
          } else {
            resultText = `An error occured (operation was ${opStatus})`;
          }
        }
        showGameResult = true;
        setTimeout(() => (showGameResult = false), 4000);

        userResults = results;
        userChoice = undefined;
      } catch (error) {
        console.error(error);
      } finally {
        playing = false;
      }
    }
  };

  onMount(async () => {
    Tezos = new TezosToolkit(RPC_URL);
    contract = await Tezos.wallet.at<RockPaperScissorsWalletType>(
      CONTRACT_ADDRESS
    );
    storage = await contract.storage();

    wallet = new BeaconWallet(walletOptions as any);
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
      await updateUserData();
    }
  });
</script>

<style lang="scss">
  section {
    width: 100%;
    position: relative;

    &.play {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .prize {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
      }
    }
  }

  .header {
    text-align: center;

    h1 {
      font-size: 3rem;
      margin: 40px;
    }

    h2 {
      font-size: 2rem;
    }
  }

  .game-play {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
  }

  .rules {
    text-align: center;

    p {
      margin: 3px;
    }
  }

  @media only screen and (max-width: 600px) {
    .header {
      h1 {
        font-size: 2.2rem;
        margin: 40px;
      }

      h2 {
        font-size: 1.5rem;
      }
    }
  }
</style>

{#if userAddress && storage}
  <MVP
    {Tezos}
    network={NETWORK}
    mvpAddress={storage.mvp ? storage.mvp.player : ""}
    {userAddress}
  />
  <WalletDisplay
    disconnect={disconnectWallet}
    {userResults}
    jackpotFactor={storage.jackpot_factor}
  />
{/if}
<main>
  <section class="header">
    <h1>ROCK PAPER SCISSORS</h1>
    <h2>Tezos Edition</h2>
  </section>
  <section class="game-play">
    <button
      class="game-choice"
      class:loader={playing && userChoice === "rock"}
      class:selected={userChoice === "rock"}
      style={playing && "cursor:not-allowed"}
      disabled={playing}
      on:click={() => (userChoice = "rock")}
    >
      <img src={RockImg} alt="rock" />
    </button>
    <button
      class="game-choice"
      class:loader={playing && userChoice === "paper"}
      class:selected={userChoice === "paper"}
      style={playing && "cursor:not-allowed"}
      disabled={playing}
      on:click={() => (userChoice = "paper")}
    >
      <img src={PaperImg} alt="paper" />
    </button>
    <button
      class="game-choice"
      class:loader={playing && userChoice === "scissors"}
      class:selected={userChoice === "scissors"}
      style={playing && "cursor:not-allowed"}
      disabled={playing}
      on:click={() => (userChoice = "scissors")}
    >
      <img src={ScissorsImg} alt="scissors" />
    </button>
  </section>
  <section class="play">
    {#if userAddress}
      <button class="primary" disabled={!userChoice} on:click={play}>
        {#if playing}
          WAITING FOR CONTRACT TO PLAY
        {:else if userChoice}
          PLAY
          {#if userChoice}
            {userChoice.toUpperCase()}
          {/if}
        {:else}
          CHOOSE AN OPTION ABOVE
        {/if}
      </button>
      {#if storage}
        <div class="prize">
          <p>Price: {storage.prize.dividedBy(10 ** 6).toNumber()} tez</p>
          <p>Play fee: {storage.play_fee.dividedBy(10 ** 6).toNumber()} tez</p>
          <p>
            Jackpot: {storage.jackpot.dividedBy(10 ** 6).toNumber()} tez
          </p>
        </div>
      {/if}
      <div class="rules">
        <p><strong>Rules</strong></p>
        <p>Standard rules of Rock, paper, scissors.</p>
        <p>The contract wins if its random choice is the same as yours.</p>
      </div>
    {:else}
      <button class="primary" on:click={connectWallet}>
        Connect your wallet
      </button>
    {/if}
  </section>
</main>
{#if showGameResult}
  <ResultToast result={gameResult} text={resultText} />
{/if}
