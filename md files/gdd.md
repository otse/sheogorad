# SHEOGORAD

## 1. The Game

Sheogorad is a text-based role-playing game powered by artificial intelligence.

Behind the scenes, a storyteller continuously ticks the game world and its characters using an in-house motivation system. The game is fundamentally about **characters living, acting, traveling, fighting, trading, helping, failing, and eventually dying**.

There are two primary types of characters:

* **Player Characters (PCs)** — characters created and unleashed by players. They have motivations, sentiments, statistics, temperaments, and a greater tendency to behave unpredictably.
* **Non-Playing Characters (NPCs)** — inhabitants of the world who mostly follow routines, needs, relationships, and local circumstances.

The player does not directly control a character in the traditional sense. Instead, the player creates a character, gives that character a reason to exist, and watches what happens.

Sheogorad is therefore less like a conventional RPG and more like a **window into a living fantasy world**.

The player reads the game.

---

# 2. Characters

Sheogorad deliberately avoids the large spreadsheet of traditional RPG statistics.

The system takes inspiration from the four basic attributes of Diablo rather than the eight attributes of Oblivion. Complexity is not the enemy, but excessive statistical granularity makes characters harder to understand.

Sheogorad prefers:

* fewer attributes
* derived statistics
* simple skills
* temperament
* motivations
* relationships
* recognizable character archetypes

The goal is not to make the system shallow.

The goal is to make it **legible**.

A player should be able to look at a character and understand roughly what kind of person they are without studying a character sheet.

Sheogorad uses simple mathematical relationships between attributes, skills, temperament, equipment, and circumstances. Skills can be derived through straightforward additions, subtractions, divisions, and modifiers.

This gives the game a Diablo-like or roguelike feeling:

> Less spreadsheet tinkering. More understanding.

Characters should be complicated because of **what they do**, not because their character sheets contain fifty numbers.

---

# 3. Morrowind and the World Sheogorad Wants

Morrowind the game provides an extraordinarily beautiful vision of Vvardenfell.

The island is full of strange architecture, ash, mist, tombs, insects, mountains, ruins, carapace buildings, ancient gods, and people who appear to live there.

That feeling is important.

Morrowind's greatest achievement is not its combat system or character statistics.

It is the feeling that **people live on the island**.

A Dunmer can live in a carapace house surrounded by ash.

A guard can walk through the mist.

A trader can sit in the same building every day.

A fisherman can return to the same coast.

A pilgrim can walk toward a shrine.

The world suggests an enormous amount of life beyond the player's immediate actions.

Sheogorad wants to make that suggestion the game itself.

Instead of building another traditional RPG around Vvardenfell, Sheogorad asks:

> What if the world itself was the thing we played?

---

# 4. The OSR Browser Game

Sheogorad has considered several ways of visualizing the world:

* low-poly maps
* tilt-shift maps
* roguelike grids
* hexagonal maps
* three-dimensional representations

None of these currently feel correct.

The desired aesthetic is closer to the old browser-game and OSR era.

The world should feel like something assembled from **areas, folders, menus, lists, descriptions, and information**.

The fundamental structure is:

```text
WORLD
└── REGION
    └── AREA
        ├── NPC
        ├── MONSTER
        ├── ITEM
        └── OBJECT
```

An Area is therefore the basic unit of the visible world.

A region might contain:

* a settlement
* surrounding wilderness
* ruins
* roads
* caves
* tombs
* farms
* mines
* shrines

An Area might then be:

* a tavern
* a mine entrance
* a tomb chamber
* a farm
* a road
* a silt strider platform
* a swamp
* a house
* a shrine
* a battlefield

The game does not currently require a 3D map.

There may be hidden positional information underneath the simulation — distance, altitude, relative position, and so on — but the player does not necessarily see those values directly.

Two characters can occupy the same Area without immediately encountering each other.

A character may be upstairs.

Another may be outside.

A third may be hiding.

The simulation can understand these relationships without turning the interface into a tactical map.

---

# 5. Construction-Set World

Sheogorad retains something resembling the Gamebryo interior/exterior distinction.

A house is effectively its own place.

A tomb is its own place.

A shop is its own place.

The wilderness outside is another place.

This creates a world that feels almost like a construction set:

```text
Seyda Neen
├── Town Square
├── Census Office
├── Tradehouse
├── Silt Strider Platform
├── Swamps
└── Individual Buildings
    ├── House
    ├── Shop
    └── Shrine
```

Characters can move between these places.

They can hide in them.

They can meet in them.

They can leave them.

The player does not necessarily need to see every movement.

The important thing is that the world remains **readable**.

---

# 6. Rune

The existing interface is intentionally strange.

Sheogorad already has some of the characteristics of a browser idle game: heavy texture, CSS effects, information panels, menus, and persistent visual elements.

The **Rune** interface gives this its own identity.

Rune is inspired by the visual language of the original game's interface while moving it toward something more abstract and game-like.

Images can be processed through Script-Fu into the Rune treatment using saturation and exclusion textures. The process can be batched and the texture changed through the plugin interface.

Rune should remain relatively restrained.

There may eventually be:

* animated textures
* subtle canvas effects
* moving glyphs
* transitions
* atmospheric background effects

But Rune is fundamentally an interface language.

It is not the game itself.

---

# 7. The Simulation

The original temptation is to simulate everything.

Trade relations.

House politics.

Empire politics.

Law.

Food.

Farming.

Fishing.

Hunting.

Travel.

Labor.

Production.

Consumption.

Wars.

Skirmishes.

Prophecies.

The problem is that a sufficiently successful simulation can become pointless.

If everybody has food, shelter, work, and stable political relationships, then the simulation simply demonstrates that Vvardenfell is functioning normally.

If everybody is starving, emigrating, and miserable, the simulation may instead demonstrate weaknesses in the game's starting conditions.

A deterministic simulation can produce another problem.

If Gnaar Mok has fish but no meat, and Orc characters prefer meat, the same Orcs may repeatedly become unhappy and leave.

The simulation then becomes a machine that repeatedly discovers the same flaw.

Sheogorad is not supposed to become:

> The Fish Economy Simulator.

The simulation should therefore be selective.

The game does not need to simulate every grain of rice.

Some things can simply be assumed.

People eat.

People sleep.

People have homes.

Farmers farm.

Fishermen fish.

Merchants sell things.

The simulation only needs to model these systems when doing so creates something interesting for the player to observe.

---

# 8. The Economy

The economy is one of the areas where a small amount of simulation could create a surprisingly large amount of life.

Consider a fish seller.

A fisherman catches fish.

The fish reach a trader.

The trader accumulates stock.

Fish eventually expire.

If too much fish arrives, the trader lowers the price.

The fisherman earns less.

The fisherman may respond by fishing elsewhere, selling elsewhere, or changing their behavior.

Suddenly, several NPCs have interacted without the game explicitly scripting an event.

That is valuable.

The economy does not need to simulate every transaction in the world.

It needs enough rules to make transactions **matter**.

Potential economic entities include:

* farmers
* fishermen
* hunters
* miners
* alchemists
* traders
* tradehouses
* taverns
* craftsmen
* suppliers
* caravans

The important question is not:

> Can Sheogorad simulate an economy?

It probably can.

The important question is:

> Does the economy create things worth reading about?

If it does, it belongs.

If it merely creates complexity, it does not.

---

# 9. Player Characters

The player's primary interaction with Sheogorad is creating characters.

A player creates a character, gives them an identity and motivation, and releases them into Vvardenfell.

The player then watches.

A character might:

* become a mercenary
* join a faction
* explore tombs
* hunt monsters
* become a pilgrim
* steal
* trade
* make friends
* make enemies
* become obsessed with an artifact
* become involved in politics
* help strangers
* betray companions
* flee from danger
* become powerful
* become irrelevant
* die

The player can follow a character throughout their life.

When the character dies, their life becomes a **Death Card**.

The Death Card records what happened.

This makes death an endpoint, but not necessarily a failure.

---

# 10. Prestige and Runes

Characters can accumulate achievements in several broad disciplines.

Examples include:

* combat
* exploration
* spirituality
* religion
* helping others
* discovery
* political activity
* criminal activity
* unusual accomplishments

Achievement in these disciplines produces **Prestige** and **Runes**.

Runes are not physical objects in Vvardenfell.

They are an external progression system.

A Rune represents something the player has accomplished through previous characters.

For example:

```text
Character dies
       ↓
Life summarized
       ↓
Achievements calculated
       ↓
Prestige / Runes awarded
       ↓
New character gains access
       ↓
New life begins
```

A player might eventually unlock more unusual archetypes or starting possibilities through accumulated Runes.

There can also be positive and negative forms of progression.

A character who repeatedly helps people may develop a different legacy from one who becomes notorious for murder and theft.

The system can therefore remember not only:

> How powerful was this character?

but also:

> What kind of person were they?

---

# 11. Characters Do Not Have to Die

Death is not the only way for a story to end.

A passive character might survive for a very long time.

A player can eventually retire a character.

Retirement produces a result similar to death:

**the character leaves the active game and becomes part of the player's history.**

This prevents passive characters from permanently occupying simulation resources.

Because running the simulation costs money, players have a limited number of active character slots.

The limitation itself becomes part of the design.

A player must decide which characters deserve to remain active.

---

# 12. What the Player Does

Sheogorad is deliberately not built around constant direct control.

The player has several forms of interaction.

## Create

Create a character.

Choose:

* identity
* temperament
* motivation
* starting characteristics
* archetype
* initial sentiment
* possibly a small amount of equipment or background

Then release the character into the world.

## Watch

Follow a character's life.

Read their recent actions.

See where they have gone.

See who they have met.

See what they have found.

See what they have become involved in.

## Read

Every Area can produce summaries.

Instead of watching every simulation tick, the player reads what happened.

Examples:

> A caravan arrived from Balmora carrying six crates of saltrice.

> A Redoran pilgrim disappeared near the tomb road.

> Three adventurers entered the tomb. Only two returned.

> The missing adventurer's sword later appeared in a trader's inventory.

The player is effectively reading the world after the simulation has already happened.

## Track

Players can follow:

* characters
* artifacts
* items
* factions
* regions
* political events
* important areas

Tracking creates a personal feed of the things the player finds interesting.

## Vote

Players can participate in limited world-level decisions.

Potential subjects include:

* prophecies
* political developments
* regional decisions
* public events
* unusual world modifiers

These votes should influence the world without turning Sheogorad into a conventional strategy game.

## Retire

A player can voluntarily end a character's active story.

The character becomes part of the player's history.

## Score / Favorite

Players can follow, favorite, or otherwise react to other players' characters.

Social features should remain lightweight.

The important thing is watching the characters, not building a social network.

---

# 13. Things to See

The central attraction of Sheogorad is not a quest list.

It is **the possibility that something interesting is happening somewhere**.

The player should constantly have reasons to open an Area, character, region, or event.

### Characters

See:

* a character's current location
* their recent actions
* their relationships
* their motivation
* their temperament
* their possessions
* their injuries
* their reputation
* their achievements
* their enemies
* their companions
* their current objective

### Heroes

Watch unusual characters develop.

A hero may begin as an insignificant adventurer and eventually become:

* a famous mercenary
* a religious figure
* a murderer
* an explorer
* a political operator
* a treasure hunter
* a monster hunter
* a cultist
* a failed adventurer
* a legendary nobody

### Artifacts

Artifacts provide persistent mysteries.

A player might see:

> **Dwemer Relic — Location Unknown**

Later:

> **Last Seen: Ald'ruhn Tradehouse**

Later:

> **Purchased by Unknown Traveler**

Later:

> **Current Holder: Sera Varo**

The artifact becomes a story that can be followed independently of any one character.

### Discoveries

Watch for:

* tombs being explored
* ruins being discovered
* hidden objects being recovered
* monsters appearing
* lost items resurfacing
* characters finding things they do not understand

### Deaths

Death should produce stories.

Not every death needs to be heroic.

A character may:

* die in combat
* disappear
* be murdered
* become lost
* succumb to a monster
* die during an expedition
* disappear from the simulation
* retire successfully

The Death Card turns that otherwise ephemeral event into a permanent artifact.

### Relationships

Watch characters become connected.

Two strangers might become companions.

A trader might develop a grudge against a thief.

A mercenary might become loyal to a noble.

Two adventurers might repeatedly encounter one another.

A character might spend their entire life trying to find somebody who has already died.

### Regions

Regions should develop identities through accumulated events.

A region might become:

* unusually prosperous
* dangerous
* politically unstable
* full of adventurers
* dominated by one faction
* known for a particular resource
* associated with a particular hero

### Areas

Areas are where the world becomes concrete.

A player can open an Area and see what is currently happening there.

Examples:

**Tradehouse**

* merchants
* stock
* visitors
* prices
* rumors
* recent transactions

**Tomb**

* creatures
* explorers
* discovered objects
* deaths
* remaining threats

**Farm**

* workers
* production
* shortages
* visitors
* nearby threats

**Road**

* travelers
* caravans
* patrols
* ambushes
* people passing through

### Political Events

Politics should be something the player can watch rather than something they must manage.

Examples:

* a House appoints somebody
* a local dispute escalates
* a law changes
* a settlement changes allegiance
* a faction loses influence
* a political figure disappears
* a treaty is signed
* a skirmish occurs

### Prophecies

Prophecies provide a long-term layer of anticipation.

The player might know that something is predicted to happen without knowing:

* who will cause it
* where it will happen
* when it will happen
* whether it will happen at all

This gives players something to speculate about.

---

# 14. Things to Do

Sheogorad's activities can be divided into **creating**, **following**, **discovering**, **participating**, and **progressing**.

## Create

* Create a hero.
* Give the hero a motivation.
* Choose their temperament.
* Select their initial archetype.
* Send them into Vvardenfell.
* Decide when to retire them.

## Follow

* Follow a favorite character.
* Track a hero's life.
* Follow another player's character.
* Track an NPC.
* Track an artifact.
* Track an item.
* Track a faction.
* Follow an Area.
* Follow a region.

## Discover

* Find unknown artifacts.
* Discover where an item ended up.
* Find unexplored locations.
* Identify recurring characters.
* Discover relationships.
* Discover political developments.
* Discover unexpected consequences.
* Find out how a prophecy resolves.

## Participate

* Vote on political developments.
* Vote on prophecies.
* React to characters.
* Favorite characters.
* Follow other players' characters.
* Participate in limited community events.

## Progress

* Earn Prestige.
* Earn Runes.
* Unlock character possibilities.
* Build a collection of Death Cards.
* Build a history of retired heroes.
* Accumulate unusual achievements.
* Develop a reputation through the characters you create.

---

# 15. The Catch-Up Report

Because Sheogorad is a simulation, the player should not need to watch it continuously.

A **Catch-Up Report** summarizes what happened while the player was away.

It might say:

> **While You Were Away**
>
> 3 characters died.
>
> A Redoran patrol fought bandits near Ald'ruhn.
>
> The artifact *Ashen Ring* changed hands twice.
>
> A tradehouse in Balmora ran out of kwama eggs.
>
> A new prophecy received 2,481 votes.
>
> Your character Sera Varo entered a tomb near Molag Mar.
>
> She has not returned.

The report turns absence into anticipation.

The player opens Sheogorad because **something may have happened**.

---

# 16. The World Feed

The player can also have a broader feed of interesting events.

The feed should favor events that are meaningful rather than reporting every simulation tick.

For example:

> **EVENT — Vivec Region**
>
> A group of adventurers discovered an ancient tomb.

> **DEATH — Molag Mar**
>
> Hero Neras Veloth was killed by a Daedric creature.

> **ARTIFACT — Balmora**
>
> The Glass Dagger has appeared in a tradehouse inventory.

> **POLITICS — Ald'ruhn**
>
> A local House official has been removed from office.

> **ECONOMY — Bitter Coast**
>
> Fish prices have risen following a shortage.

The feed is effectively the game's newspaper.

---

# 17. The Interesting Part

The simulation does not need to make every citizen interesting.

Most people should probably be boring.

That is what makes unusual characters unusual.

Most NPCs are simply living their lives.

Heroes are the characters who disturb the equilibrium.

They enter tombs.

They hunt monsters.

They steal artifacts.

They challenge powerful people.

They travel somewhere dangerous.

They become involved in things ordinary inhabitants would never touch.

This gives the world two layers:

**Ordinary Vvardenfell**

People live, work, eat, trade, worship, travel, and sleep.

**Adventuring Vvardenfell**

Heroes, monsters, artifacts, prophecies, criminals, cultists, mercenaries, and other unusual forces disrupt that ordinary life.

The game does not need every citizen to be a hero.

It needs the heroes to **disturb the world around them**.

---

# 18. Red Year

The Rune aesthetic creates a problem for a completely faithful recreation of the original Morrowind period.

The original Vvardenfell is strange and dangerous, but it is also relatively stable.

The Red Year provides a more useful starting point.

The Red Year does not mean that Vvardenfell has ended.

It means that Vvardenfell has changed.

This gives Sheogorad room to retain recognizable places, people, Houses, religions, ruins, resources, and cultures while creating a world that is less static.

The island can still contain:

* Dunmer communities
* carapace architecture
* Redoran
* Telvanni
* Imperial remnants
* shrines
* tombs
* ruins
* ashlands
* saltrice
* glass
* ebony
* alchemy
* Daedra
* Dwemer mysteries
* prophecies

But the world has been disturbed.

Vvardenfell is rebuilding.

The result can be darker without making the entire setting apocalyptic.

The Red Year provides an **arena for uncertainty**.

That is useful for Sheogorad because the game needs things to happen.

---

# 19. Adventurers

One of the most important distinctions is between ordinary inhabitants and adventurers.

A farmer should not behave like a player character.

A fisherman should not randomly decide to raid a tomb.

A merchant should not normally challenge a monster.

But an adventurer might.

Sheogorad can therefore have a class of characters who are naturally disruptive:

* mercenaries
* adventurers
* pilgrims
* treasure hunters
* assassins
* monster hunters
* cultists
* wandering warriors
* mages
* explorers
* criminals

These characters create stories.

They are the people who turn a static world into a moving one.

---

# 20. Esroniet

Esroniet is currently an experimental idea rather than a foundational part of the game.

It could eventually function as:

* a home base
* an external location
* a monastic order
* a source of unusual characters
* a place connected to the Rune system
* a destination for retired heroes

But Sheogorad does not currently need Esroniet to work.

The core game should work without it.

---

# 21. Design Principle

Sheogorad should not try to simulate everything.

It should simulate **enough to create stories**.

The player should not care that a fisherman performed an economically accurate transaction.

They should care that:

> The fisherman sold his catch to a trader, the trader's stock became excessive, the price fell, the fisherman moved to another coast, met a mercenary there, and six days later that mercenary died carrying an artifact that eventually appeared in a Balmora tradehouse.

The simulation exists to produce stories.

The stories exist to give the player something to read.

And the player reads because they want to know:

> **What happens next?**

---

# 22. Core Player Loop

```text
CREATE HERO
     ↓
RELEASE INTO WORLD
     ↓
WATCH / READ
     ↓
DISCOVER EVENTS
     ↓
FOLLOW CHARACTERS / ITEMS / ARTIFACTS
     ↓
CHARACTER LIVES
     ↓
CHARACTER DIES OR RETIRES
     ↓
DEATH CARD + PRESTIGE + RUNES
     ↓
CREATE ANOTHER HERO
     ↓
WATCH WHAT HAPPENS
```

Alongside this loop:

```text
READ WORLD
VOTE
FOLLOW
TRACK
SPECULATE
DISCOVER
COLLECT
```

Sheogorad is therefore not primarily about controlling a hero.

It is about **creating a disturbance in a world and watching the consequences**.
