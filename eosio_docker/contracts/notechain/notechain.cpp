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

// Replace the contract class name when you start your own project
CONTRACT notechain : public eosio::contract {
  private:

    TABLE parkstruct {
      uint64_t      id;  	   		// primary key, parking id
      name          owner;     		// account name for the owner
      uint64_t      added; 	   		// when it was added
	  std::string 	position;		// 4x latlng
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
    notechain( name receiver, name code, datastream<const char*> ds ):
                contract( receiver, code, ds ),
                _parkings( receiver, receiver.value ) {}

    ACTION add( name user, std::string position, float price ) {
		require_auth( user );

		_parkings.emplace( _self, [&]( auto& new_user ) {
		  new_user.id 			= _parkings.available_primary_key();
		  new_user.owner    	= user;
		  new_user.added   		= now();
		  new_user.position  	= position;
		  new_user.price		= price;
        });
      // to sign the action with the given account
		/*
      // create new / update note depends whether the user account exist or not
      if (isnewuser(user)) {
        // insert new note
        _notes.emplace( _self, [&]( auto& new_user ) {
          new_user.prim_key    = _notes.available_primary_key();
          new_user.user        = user;
          new_user.note        = note;
          new_user.timestamp   = now();
        });
      } else {
        // get object by secordary key
        auto note_index = _notes.get_index<name("getbyuser")>();
        auto &note_entry = note_index.get(user.value);
        // update existing note
        _notes.modify( note_entry, _self, [&]( auto& modified_user ) {
          modified_user.note      = note;
          modified_user.timestamp = now();
        });
      } */
    }
	
	ACTION take( name user, uint64_t id) {
		require_auth( user );

		auto note_index = _parkings.find(id);
		eosio_assert(note_index != _parkings.end(), "Parking id not found");
		eosio_assert(note_index->used_from == 0, "Parking spot is already taken");
		_parkings.modify( note_index, get_self(), [&]( auto& p ) {
			p.used_from = now();
			p.used_by = user;
        });		
	}

	ACTION release( name user, uint64_t id) {
		require_auth( user );

		auto note_index = _parkings.find(id);
		eosio_assert(note_index != _parkings.end(), "Parking id not found");
		eosio_assert(note_index->used_by == user, "Wrong user found");
		
		// payment over here
		_parkings.modify( note_index, get_self(), [&]( auto& p ) {
			p.used_from = 0;
			p.used_by = name();
        });				
	}
	
	ACTION reserve( name user, uint64_t id) {
		require_auth( user );

		auto note_index = _parkings.find(id);
		eosio_assert(note_index != _parkings.end(), "Parking id not found");
		eosio_assert(note_index->used_from == 0, "Parking spot is already taken");
		// payment over here
		_parkings.modify( note_index, get_self(), [&]( auto& p ) {
			p.reserved = now();
			p.reserved_by = user;
        });						
	}

	ACTION unreserve( name user, uint64_t id) {
		require_auth( user );

		auto note_index = _parkings.find(id);
		eosio_assert(note_index != _parkings.end(), "Parking id not found");
		eosio_assert(note_index->reserved_by == user, "Wrong user found");
		// payment over here
		_parkings.modify( note_index, get_self(), [&]( auto& p ) {
			p.reserved = 0;
			p.reserved_by = name();
        });						
	}
};

// specify the contract name, and export a public action: update
EOSIO_DISPATCH( notechain, (add)(take)(release)(reserve)(unreserve) )
