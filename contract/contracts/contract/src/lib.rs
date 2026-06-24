#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Booking {
    pub user: Address,
    pub slot_id: u64,
    pub start_time: u64,
    pub end_time: u64,
    pub amount: i128,
    pub status: u32,
    pub transaction_hash: String,
}

#[contracttype]
#[derive(Clone)]
pub struct Slot {
    pub id: u64,
    pub location: String,
    pub slot_number: String,
    pub hourly_rate: i128,
    pub available: bool,
}

#[contracttype]
pub enum DataKey {
    Booking(u64),
    Slot(u64),
    NextId,
    SlotsCount,
    TokenAddress,
    Admin,
}

#[contract]
pub struct ParkChain;

#[contractimpl]
impl ParkChain {
    pub fn init(env: Env, admin: Address, token_address: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::NextId, &1u64);
        env.storage().instance().set(&DataKey::SlotsCount, &0u64);
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenAddress, &token_address);
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    pub fn get_token(env: Env) -> Address {
        env.storage().instance().get(&DataKey::TokenAddress).unwrap()
    }

    pub fn set_token(env: Env, admin: Address, token_address: Address) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(admin, stored_admin, "not admin");
        env.storage().instance().set(&DataKey::TokenAddress, &token_address);
    }

    pub fn register_slot(
        env: Env,
        admin: Address,
        location: String,
        slot_number: String,
        hourly_rate: i128,
    ) -> u64 {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(admin, stored_admin, "not admin");
        let count: u64 = env.storage().instance().get(&DataKey::SlotsCount).unwrap_or(0);
        let id = count + 1;
        let slot = Slot {
            id,
            location,
            slot_number,
            hourly_rate,
            available: true,
        };
        env.storage().persistent().set(&DataKey::Slot(id), &slot);
        env.storage().instance().set(&DataKey::SlotsCount, &id);
        id
    }

    pub fn get_slot(env: Env, slot_id: u64) -> Slot {
        env.storage()
            .persistent()
            .get(&DataKey::Slot(slot_id))
            .expect("slot not found")
    }

    pub fn get_slots_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::SlotsCount).unwrap_or(0)
    }

    pub fn toggle_slot(env: Env, admin: Address, slot_id: u64) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(admin, stored_admin, "not admin");
        let key = DataKey::Slot(slot_id);
        let mut slot: Slot = env.storage().persistent().get(&key).expect("slot not found");
        slot.available = !slot.available;
        env.storage().persistent().set(&key, &slot);
    }

    pub fn create_booking(
        env: Env,
        user: Address,
        slot_id: u64,
        start_time: u64,
        end_time: u64,
    ) -> u64 {
        user.require_auth();
        let key = DataKey::Slot(slot_id);
        let mut slot: Slot = env.storage().persistent().get(&key).expect("slot not found");
        assert!(slot.available, "slot not available");
        slot.available = false;
        env.storage().persistent().set(&key, &slot);

        let id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);
        let booking = Booking {
            user: user.clone(),
            slot_id,
            start_time,
            end_time,
            amount: 0,
            status: 0,
            transaction_hash: String::from_str(&env, ""),
        };
        env.storage().persistent().set(&DataKey::Booking(id), &booking);
        env.storage().instance().set(&DataKey::NextId, &(id + 1));
        id
    }

    pub fn check_in(env: Env, booking_id: u64, user: Address) {
        user.require_auth();
        let key = DataKey::Booking(booking_id);
        let mut booking: Booking = env.storage().persistent().get(&key).expect("booking not found");
        assert_eq!(booking.status, 0, "already checked in");
        assert_eq!(booking.user, user, "not your booking");
        booking.status = 1;
        env.storage().persistent().set(&key, &booking);
    }

    pub fn check_out(env: Env, booking_id: u64, user: Address, hourly_rate: i128) -> i128 {
        user.require_auth();
        let key = DataKey::Booking(booking_id);
        let mut booking: Booking = env.storage().persistent().get(&key).expect("booking not found");
        assert_eq!(booking.status, 1, "not checked in");
        assert_eq!(booking.user, user, "not your booking");
        booking.status = 2;
        let fee = Self::calculate_fee(env.clone(), booking.start_time, booking.end_time, hourly_rate);
        booking.amount = fee;
        env.storage().persistent().set(&key, &booking);

        // Mark slot available again
        let slot_key = DataKey::Slot(booking.slot_id);
        let mut slot: Slot = env.storage().persistent().get(&slot_key).expect("slot not found");
        slot.available = true;
        env.storage().persistent().set(&slot_key, &slot);

        fee
    }

    pub fn calculate_fee(_env: Env, start_time: u64, end_time: u64, hourly_rate: i128) -> i128 {
        let hours = if end_time > start_time {
            ((end_time - start_time + 3599) / 3600) as i128
        } else {
            0
        };
        if hours < 1 { hourly_rate } else { hours * hourly_rate }
    }

    pub fn make_payment(env: Env, booking_id: u64, user: Address) {
        user.require_auth();
        let key = DataKey::Booking(booking_id);
        let mut booking: Booking = env.storage().persistent().get(&key).expect("booking not found");
        assert_eq!(booking.status, 2, "not checked out");
        assert_eq!(booking.user, user, "not your booking");

        // Transfer tokens from user to contract
        let token_addr: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
        let contract_addr = env.current_contract_address();
        token::Client::new(&env, &token_addr).transfer(&user, &contract_addr, &booking.amount);

        booking.status = 3;
        env.storage().persistent().set(&key, &booking);
    }

    pub fn get_booking(env: Env, booking_id: u64) -> Booking {
        env.storage()
            .persistent()
            .get(&DataKey::Booking(booking_id))
            .expect("booking not found")
    }
}

mod test;
