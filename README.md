Minibattle (aka first nodejs experience)
==========

This is a proof of concept mini multiplayer (currently text based ) game. We have three players : Russia, China and GOD. God can add equipment to players and start battle. Before starting battle other players have to connect and choose side. 
At present not GOD type players and guests can observe result of battle and short nano statictics.

Installation
------------
* git clone https://github.com/nmros/minibattle.git
* npm install
* node server.js

Connecting 
----------

* type in browser http://127.0.0.1:8080
* choose player

TODO:
-----

* add some fancy gui gfx and amimations
* add fair play calculation between different forces
* add additional equipment parameters
* add test coverage (frontend / backend)
* add database persistence
