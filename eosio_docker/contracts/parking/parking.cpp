#include <eosiolib/eosio.hpp>

using namespace eosio;

/*
#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>
using namespace eosio;
class hello : public eosio::contract {
  public:
      using contract::contract;

      [[eosio::action]]
      void hi( name user ) {
         print( "Hello, ", name{user} );
      }
};
EOSIO_DISPATCH( hello, (hi) )
*/

CONTRACT parking : public eosio::contract {
  private:

    TABLE parkstruct {
      uint64_t      id;  	   		// primary key, parking id
      name          owner;     		// account name for the owner
      uint64_t      added; 	   		// when it was added
	  std::string 	position;		// 4x latlng for polygon
	  float			price = 0; 	   	// price per hour
	  uint64_t		reserved = 0;  	// date when reservation has been made
	  name			reserved_by;	// who reserved that
	  uint64_t		used_from = 0;	// date from when someone started to use parking, 0 mean it's free to take
	  name			used_by;		// who's using it

      auto primary_key() const { return id; }
    };

    // create a multi-index table and support secondary key
    typedef eosio::multi_index< name("parkstruct"), parkstruct> parking_table;

    parking_table _parkings;

  public:
    using contract::contract;

    // constructor
    parking( name receiver, name code, datastream<const char*> ds ):
                contract( receiver, code, ds ),
                _parkings( receiver, receiver.value ) {}

    ACTION add( name user, std::string position, float price ) {
		require_auth( user );
		
		for(auto& p : _parkings) {
			eosio_assert(p.position != position, "This parking is already in database");
		}
	
		_parkings.emplace( _self, [&]( auto& new_user ) {
		  new_user.id 			= _parkings.available_primary_key();
		  new_user.owner    	= user;
		  new_user.added   		= now();
		  new_user.position  	= position;
		  new_user.price		= price;
        });
    }
	
	ACTION take( name user, uint64_t id) {
		require_auth( user );
		
		auto p_index = _parkings.find(id);
		eosio_assert(p_index != _parkings.end(), "Parking id not found");
		eosio_assert(p_index->used_from == 0, "Parking spot is already taken");
		eosio_assert(!p_index->reserved || (p_index->reserved_by == user), "This parking spot is reserved!");
		_parkings.modify( p_index, get_self(), [&]( auto& p ) {
			p.used_from = now();
			p.used_by = user;
			p.reserved_by = name();
			p.reserved = 0;
        });		
	}

	ACTION release( name user, uint64_t id) {
		require_auth( user );

		auto p_index = _parkings.find(id);
		eosio_assert(p_index != _parkings.end(), "Parking id not found");
		eosio_assert(p_index->used_from != 0, "Parking spot is not in use");
		eosio_assert(p_index->used_by == user, "Wrong user");

		uint64_t used_time = now() - p_index->used_from;
		float used_time_price = p_index->price * 3600 / used_time;
		/* action(
			permission_level{ user, N(active) },
			N(eosio.token), N(transfer),
			std::make_tuple(user, _self, used_time_price, std::string(""))
		).send(); */
	 
		_parkings.modify( p_index, get_self(), [&]( auto& p ) {
			p.used_from = 0;
			p.used_by = name();
        });				
	}
	
	ACTION reserve( name user, uint64_t id) {
		require_auth( user );

		auto p_index = _parkings.find(id);
		eosio_assert(p_index != _parkings.end(), "Parking id not found");
		eosio_assert(p_index->used_from == 0, "Parking spot is already taken");
		_parkings.modify( p_index, get_self(), [&]( auto& p ) {
			p.reserved = now();
			p.reserved_by = user;
        });						
	}

	ACTION unreserve( name user, uint64_t id) {
		require_auth( user );

		auto p_index = _parkings.find(id);
		eosio_assert(p_index != _parkings.end(), "Parking id not found");
		eosio_assert(p_index->reserved_by == user, "Wrong user");
		_parkings.modify( p_index, get_self(), [&]( auto& p ) {
			p.reserved = 0;
			p.reserved_by = name();
        });
	}
};

// specify the contract name, and export a public action: update
EOSIO_DISPATCH( parking, (add)(take)(release)(reserve)(unreserve) )
