#![cfg(test)]
use super::*;
use soroban_sdk::{token, Env, String};
use soroban_sdk::testutils::Address as _;

/// Helper to register a test token and mint to user
fn setup_token(env: &Env, admin: &soroban_sdk::Address) -> soroban_sdk::Address {
    let token_addr = env.register(
        soroban_sdk::token::StellarAsset,
        (admin.clone(),),
    );
    // Mint some tokens to the admin
    let token_client = token::Client::new(env, &token_addr);
    token_client.mint(admin, &1000000i128);
    token_addr
}

#[test]
fn test_init_and_admin() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let token_addr = soroban_sdk::Address::generate(&env);

    client.init(&admin, &token_addr);

    let stored_admin = client.get_admin();
    assert_eq!(stored_admin, admin);

    let stored_token = client.get_token();
    assert_eq!(stored_token, token_addr);
}

#[test]
fn test_register_and_get_slot() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let token_addr = soroban_sdk::Address::generate(&env);
    client.init(&admin, &token_addr);

    let id = client.register_slot(
        &admin,
        &String::from_str(&env, "Downtown Garage"),
        &String::from_str(&env, "A01"),
        &100i128,
    );
    assert_eq!(id, 1);

    let slot = client.get_slot(&1);
    assert_eq!(slot.location, String::from_str(&env, "Downtown Garage"));
    assert_eq!(slot.slot_number, String::from_str(&env, "A01"));
    assert_eq!(slot.hourly_rate, 100);
    assert!(slot.available);

    let count = client.get_slots_count();
    assert_eq!(count, 1);
}

#[test]
fn test_toggle_slot() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let token_addr = soroban_sdk::Address::generate(&env);
    client.init(&admin, &token_addr);
    client.register_slot(&admin, &String::from_str(&env, "Garage"), &String::from_str(&env, "B01"), &50i128);

    // Toggle off
    client.toggle_slot(&admin, &1);
    let slot = client.get_slot(&1);
    assert!(!slot.available);

    // Toggle back on
    client.toggle_slot(&admin, &1);
    let slot = client.get_slot(&1);
    assert!(slot.available);
}

#[test]
fn test_set_token() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let token1 = soroban_sdk::Address::generate(&env);
    let token2 = soroban_sdk::Address::generate(&env);

    client.init(&admin, &token1);
    client.set_token(&admin, &token2);

    assert_eq!(client.get_token(), token2);
}

#[test]
fn test_full_booking_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let user = soroban_sdk::Address::generate(&env);
    let token_addr = soroban_sdk::Address::generate(&env);
    client.init(&admin, &token_addr);
    client.register_slot(&admin, &String::from_str(&env, "Garage"), &String::from_str(&env, "C01"), &50i128);

    // Create booking (marks slot unavailable)
    let booking_id = client.create_booking(&user, &1, &1000, &2000);
    assert_eq!(booking_id, 1);

    let slot = client.get_slot(&1);
    assert!(!slot.available, "slot should be unavailable after booking");

    // Check booking exists
    let booking = client.get_booking(&1);
    assert_eq!(booking.user, user);
    assert_eq!(booking.slot_id, 1);
    assert_eq!(booking.status, 0);

    // Check in
    client.check_in(&1, &user);
    let booking = client.get_booking(&1);
    assert_eq!(booking.status, 1);

    // Check out and calculate fee (1 hour at 50 rate = 50)
    let fee = client.check_out(&1, &user, &50i128);
    assert_eq!(fee, 50);
    let booking = client.get_booking(&1);
    assert_eq!(booking.status, 2);
    assert_eq!(booking.amount, 50);

    // Slot should be available again after checkout
    let slot = client.get_slot(&1);
    assert!(slot.available, "slot should be available after checkout");

    // Make payment (this would transfer tokens in production)
    client.make_payment(&1, &user);
    let booking = client.get_booking(&1);
    assert_eq!(booking.status, 3);
}

#[test]
fn test_calculate_fee() {
    let env = Env::default();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    // Less than 1 hour rounds up to 1 hour = 10
    let fee = client.calculate_fee(&1000, &1800, &10i128);
    assert_eq!(fee, 10);

    // 1 hour = 10
    let fee = client.calculate_fee(&1000, &4600, &10i128);
    assert_eq!(fee, 10);

    // 2 hours = 20
    let fee = client.calculate_fee(&1000, &8200, &10i128);
    assert_eq!(fee, 20);
}

#[test]
#[should_panic(expected = "booking not found")]
fn test_get_nonexistent_booking() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);
    client.get_booking(&999);
}

#[test]
#[should_panic(expected = "already checked in")]
fn test_double_checkin() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let user = soroban_sdk::Address::generate(&env);
    let token_addr = soroban_sdk::Address::generate(&env);
    client.init(&admin, &token_addr);
    client.register_slot(&admin, &String::from_str(&env, "G"), &String::from_str(&env, "D01"), &50i128);

    client.create_booking(&user, &1, &1000, &2000);
    client.check_in(&1, &user);
    client.check_in(&1, &user);
}

#[test]
#[should_panic(expected = "not checked in")]
fn test_checkout_without_checkin() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let user = soroban_sdk::Address::generate(&env);
    let token_addr = soroban_sdk::Address::generate(&env);
    client.init(&admin, &token_addr);
    client.register_slot(&admin, &String::from_str(&env, "G"), &String::from_str(&env, "E01"), &50i128);

    client.create_booking(&user, &1, &1000, &2000);
    client.check_out(&1, &user, &5i128);
}

#[test]
#[should_panic(expected = "not checked out")]
fn test_payment_without_checkout() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let user = soroban_sdk::Address::generate(&env);
    let token_addr = soroban_sdk::Address::generate(&env);
    client.init(&admin, &token_addr);
    client.register_slot(&admin, &String::from_str(&env, "G"), &String::from_str(&env, "F01"), &50i128);

    client.create_booking(&user, &1, &1000, &2000);
    client.make_payment(&1, &user);
}

#[test]
#[should_panic(expected = "not your booking")]
fn test_wrong_user_checkin() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let user = soroban_sdk::Address::generate(&env);
    let other = soroban_sdk::Address::generate(&env);
    let token_addr = soroban_sdk::Address::generate(&env);
    client.init(&admin, &token_addr);
    client.register_slot(&admin, &String::from_str(&env, "G"), &String::from_str(&env, "G01"), &50i128);

    client.create_booking(&user, &1, &1000, &2000);
    client.check_in(&1, &other);
}

#[test]
#[should_panic(expected = "slot not found")]
fn test_get_nonexistent_slot() {
    let env = Env::default();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);
    client.get_slot(&999);
}

#[test]
#[should_panic(expected = "slot not available")]
fn test_book_unavailable_slot() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let user1 = soroban_sdk::Address::generate(&env);
    let user2 = soroban_sdk::Address::generate(&env);
    let token_addr = soroban_sdk::Address::generate(&env);
    client.init(&admin, &token_addr);
    client.register_slot(&admin, &String::from_str(&env, "G"), &String::from_str(&env, "H01"), &50i128);

    // First booking works
    client.create_booking(&user1, &1, &1000, &2000);
    // Second booking on same slot should fail
    client.create_booking(&user2, &1, &3000, &4000);
}

#[test]
#[should_panic(expected = "not admin")]
fn test_non_admin_register_slot() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let attacker = soroban_sdk::Address::generate(&env);
    let token_addr = soroban_sdk::Address::generate(&env);
    client.init(&admin, &token_addr);

    // Non-admin tries to register slot
    client.register_slot(&attacker, &String::from_str(&env, "G"), &String::from_str(&env, "X01"), &50i128);
}

#[test]
fn test_multiple_bookings() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ParkChain, ());
    let client = ParkChainClient::new(&env, &contract_id);

    let admin = soroban_sdk::Address::generate(&env);
    let user = soroban_sdk::Address::generate(&env);
    let token_addr = soroban_sdk::Address::generate(&env);
    client.init(&admin, &token_addr);

    // Register 3 slots
    client.register_slot(&admin, &String::from_str(&env, "G"), &String::from_str(&env, "I01"), &50i128);
    client.register_slot(&admin, &String::from_str(&env, "G"), &String::from_str(&env, "I02"), &60i128);
    client.register_slot(&admin, &String::from_str(&env, "G"), &String::from_str(&env, "I03"), &70i128);

    let id1 = client.create_booking(&user, &1, &1000, &2000);
    let id2 = client.create_booking(&user, &2, &3000, &4000);
    let id3 = client.create_booking(&user, &3, &5000, &6000);

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(id3, 3);

    assert_eq!(client.get_booking(&1).slot_id, 1);
    assert_eq!(client.get_booking(&2).slot_id, 2);
    assert_eq!(client.get_booking(&3).slot_id, 3);

    assert_eq!(client.get_slots_count(), 3);
}
