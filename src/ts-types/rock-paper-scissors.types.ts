
import { ContractAbstractionFromContractType, WalletContractAbstractionFromContractType } from './type-utils';
import { address, BigMap, mutez, nat } from './type-aliases';

type Storage = {
    accrued_fees: mutez;
    admin: address;
    jackpot: mutez;
    jackpot_factor: nat;
    mvp?: {
        player: address;
        wins: nat;
    };
    paused: boolean;
    play_fee: mutez;
    played_games: nat;
    players: BigMap<address, {
        last_game: {
            contract: nat;
            player: nat;
        };
        lost: nat;
        wins_in_a_row: nat;
        won: {
            amount: nat;
            total: mutez;
        };
    }>;
    prize: mutez;
    randomizer_address: address;
    randomizer_creator: address;
};

type Methods = {
    add_funds: () => Promise<void>;
    pause: () => Promise<void>;
    play: (param: nat) => Promise<void>;
    update_admin: (param: address) => Promise<void>;
    update_jackpot_factor: (param: nat) => Promise<void>;
    update_play_fee: (param: mutez) => Promise<void>;
    update_prize: (param: mutez) => Promise<void>;
    update_randomizer_address: (param: address) => Promise<void>;
    update_randomizer_creator: (param: address) => Promise<void>;
    withdraw: (
        _0: mutez,
        _1: boolean,
    ) => Promise<void>;
};

type MethodsObject = {
    add_funds: () => Promise<void>;
    pause: () => Promise<void>;
    play: (param: nat) => Promise<void>;
    update_admin: (param: address) => Promise<void>;
    update_jackpot_factor: (param: nat) => Promise<void>;
    update_play_fee: (param: mutez) => Promise<void>;
    update_prize: (param: mutez) => Promise<void>;
    update_randomizer_address: (param: address) => Promise<void>;
    update_randomizer_creator: (param: address) => Promise<void>;
    withdraw: (params: {
        0: mutez,
        1: boolean,
    }) => Promise<void>;
};

type contractTypes = { methods: Methods, methodsObject: MethodsObject, storage: Storage, code: { __type: 'RockPaperScissorsCode', protocol: string, code: object[] } };
export type RockPaperScissorsContractType = ContractAbstractionFromContractType<contractTypes>;
export type RockPaperScissorsWalletType = WalletContractAbstractionFromContractType<contractTypes>;
