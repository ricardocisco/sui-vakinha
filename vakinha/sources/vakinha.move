module vakinha::vakinha;

use std::string::String;
use sui::coin::{Self, Coin};
use sui::sui::SUI;

#[allow(lint(coin_field))]
public struct Vakinha has key, store {
    id: UID,
    name: String,
    description: String,
    image_url: String,
    goal_amount: u64,
    amount_donated: u64,
    owner: address,
    balance: Coin<SUI>,
    is_active: bool,
}

public struct VakinhaCreated has copy, drop {
    vakinha_id: address,
    name: String,
    description: String,
    image_url: String,
    owner: address,
    goal_amount: u64,
    amount_donated: u64,
    is_active: bool,
}

public struct DonationMade has copy, drop {
    vakinha_id: address,
    donor: address,
    amount: u64,
    total_donated: u64,
}

public struct WithdrawMade has copy, drop {
    vakinha_id: address,
    owner: address,
    amount: u64,
}

const E_VAKINHA_INACTIVE: u64 = 0;
const E_NOT_OWNER: u64 = 1;
const E_INVALID_AMOUNT: u64 = 2;
const E_NO_FUNDS: u64 = 3;
const E_INSUFFICIENT_COIN_VALUE: u64 = 4;

public fun create_vakinha(
    name: String,
    image_url: String,
    description: String,
    goal_amount: u64,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);
    let vakinha_id = object::new(ctx);

    let vakinha = Vakinha {
        id: vakinha_id,
        name,
        image_url,
        description,
        owner: sender,
        goal_amount,
        amount_donated: 0,
        balance: coin::zero<SUI>(ctx),
        is_active: true,
    };
    sui::event::emit(VakinhaCreated {
        vakinha_id: object::uid_to_address(&vakinha.id),
        name: vakinha.name,
        description: vakinha.description,
        image_url: vakinha.image_url,
        owner: sender,
        goal_amount,
        amount_donated: 0,
        is_active: true,
    });

    transfer::share_object(vakinha);
}

#[allow(lint(self_transfer))]
public fun donate(
    vakinha: &mut Vakinha,
    mut payment: Coin<SUI>,
    donation_amount: u64,
    ctx: &mut TxContext,
) {
    assert!(vakinha.is_active, E_VAKINHA_INACTIVE);
    assert!(donation_amount > 0, E_INVALID_AMOUNT);

    let payment_value = coin::value(&payment);
    assert!(payment_value >= donation_amount, E_INSUFFICIENT_COIN_VALUE);

    if (payment_value == donation_amount) {
        coin::join(&mut vakinha.balance, payment);
    } else {
        let donation_coin = coin::split(&mut payment, donation_amount, ctx);
        coin::join(&mut vakinha.balance, donation_coin);
        transfer::public_transfer(payment, tx_context::sender(ctx));
    };

    vakinha.amount_donated = vakinha.amount_donated + donation_amount;

    sui::event::emit(DonationMade {
        vakinha_id: object::uid_to_address(&vakinha.id),
        donor: tx_context::sender(ctx),
        amount: donation_amount,
        total_donated: vakinha.amount_donated,
    })
}

#[allow(lint(self_transfer))]
public fun withdraw(vakinha: &mut Vakinha, ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    assert!(sender == vakinha.owner, E_NOT_OWNER);

    let balance_value = coin::value(&vakinha.balance);
    assert!(balance_value > 0, E_NO_FUNDS);
    vakinha.is_active = false;

    let withdraw_coin = coin::split(&mut vakinha.balance, balance_value, ctx);

    transfer::public_transfer(withdraw_coin, sender);

    sui::event::emit(WithdrawMade {
        vakinha_id: object::uid_to_address(&vakinha.id),
        owner: sender,
        amount: balance_value,
    });
}

public fun withdraw_coin(vakinha: &mut Vakinha, ctx: &mut TxContext): Coin<SUI> {
    let sender = tx_context::sender(ctx);
    assert!(sender == vakinha.owner, E_NOT_OWNER);

    let balance_value = coin::value(&vakinha.balance);
    assert!(balance_value > 0, E_NO_FUNDS);
    vakinha.is_active = false;

    let withdraw_coin = coin::split(&mut vakinha.balance, balance_value, ctx);

    sui::event::emit(WithdrawMade {
        vakinha_id: object::uid_to_address(&vakinha.id),
        owner: sender,
        amount: balance_value,
    });
    withdraw_coin
}

public fun get_vakinha_info(vakinha: &Vakinha): (String, String, String, address, u64, u64, bool) {
    (
        vakinha.name,
        vakinha.image_url,
        vakinha.description,
        vakinha.owner,
        vakinha.goal_amount,
        vakinha.amount_donated,
        vakinha.is_active,
    )
}

public fun get_balance(vakinha: &Vakinha): u64 {
    coin::value(&vakinha.balance)
}

public fun is_goal_reached(vakinha: &Vakinha): bool {
    vakinha.amount_donated >= vakinha.goal_amount
}
