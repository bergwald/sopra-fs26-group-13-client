# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - 23.03.26 to 29.03.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@PAKaeser**      | 28.03.26 | [Commit 6b79421](https://github.com/bergwald/sopra-fs26-group-13-server/commit/6b794219c04df89b36e11aed6de7904e42dea3ad) | Added a Entity for database representation for game info per round and session | Lets us keep track of game infos like image url or round. |
|                    | 28.03.26 | [Commit cffae0a](https://github.com/bergwald/sopra-fs26-group-13-server/commit/cffae0a9b9dc8728a57d66270dbb2a8c9f7cd8d6) | Added DTO for game data obj and mapper | Needed for response for GET request during game for each round. |
| **@juliand924**    | 28.03.26 | [Commit 8797212](https://github.com/bergwald/sopra-fs26-group-13-server/commit/87972123c81933bc8a0805a0d123541724452980) | Added initially the classes for the session controller and service | The session controller and service are needed for handling the game session |
|                    | 28.03.26 | [Commit 9c1e490](https://github.com/bergwald/sopra-fs26-group-13-server/commit/9c1e490bd8d3167b4e227a961c1e39c3dd7178a5) | Added Session object which represents the session table in our database | Defines the structure how the session is handled in the database. |
| **@plaiimade**     | 29.03.26 | [Commit 34464cc](https://github.com/bergwald/sopra-fs26-group-13-client/commit/34464cc14f4e90ec1c4b6842e1e2b4d90f71aeae) | Added all blank page folders and files in the frontend | Gives us the underlying structure of the frontend, to continue completing it in the coming weeks |
|                    | 29.03.26 | [Commit a6b06a7](https://github.com/bergwald/sopra-fs26-group-13-client/commit/a6b06a74bc0a61222f271576ec7d5ab36564c075) | Added proper HTML of first page (/login), serves as inspiration of how the pages will most likely look like | Serves as a visualization of how the frontend pages will look like and means first page is implemented |
| **@bergwald**      | 25.03.26 | [Commit 0a89f92](https://github.com/bergwald/sopra-fs26-group-13-server/commit/0a89f927e4b91f3a5adc9369b96f239e04f108f6) | Updated the database tables to ensure that the username is not updatable | Ensures that the username cannot be updated, which is a requirement of one of our user stories. |
|                    | 25.03.26 | [Commit e45d341](https://github.com/bergwald/sopra-fs26-group-13-server/commit/e45d3411c4de502e25abec458d5dae7f2b187686) | Updated the /users/{userId} route such that the bio of a user can be changed. | Allows a user to update his bio through his own profile page. |

---

## Contributions Week 2 - 30.03.2026 to 05.04.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@PAKaeser**      | 05.04.26 | [Commit 3e49c48](https://github.com/bergwald/sopra-fs26-group-13-server/commit/3e49c488712fa25181142a2c2d833011324abae3) | Added GameDataRepository | Lets us save gamedata persistent |
|                    | 05.04.26 | [Commit da1f1e6](https://github.com/bergwald/sopra-fs26-group-13-server/commit/da1f1e62754444e86ce301232e183e805aa0b65e) | added Tests for GameDataRepository | Checks functionality of Repository (findByDataId) and fulfills SonarQube coverage percentage |
| **@juliand924**    | 05.04.26 | [Commit 0f9ff8e](https://github.com/bergwald/sopra-fs26-group-13-server/commit/0f9ff8e97da729fbd6a8dd195c02d0a781054569) | Added the session user repository and added the functionality that a user can join a session. | The repository is needed for the CRUD operations with the "sessionuser" table which holds the information which user is in which session. This further entails that a user can join a session which was added also in this commit. |
|                    | 03.04.26 | [Commit b531850](https://github.com/bergwald/sopra-fs26-group-13-server/commit/b53185048f044d33b7f21c0fbd2a024c03dd994c) | Initially adding the table for handling the user and session | This table is needed to map a user to a geo guesser session. In this table the scores of each of the user will also be tracked. |
| **@bergwald**      | 05.04.26 | [Commit af85010](https://github.com/bergwald/sopra-fs26-group-13-server/commit/af85010e49764edad174122eb80a1025d8e08148) | Added a function to compute the distance between the guessed and actual location | Needed to compute a score for the guessed location and to give feedback to the player |
|                    | 05.04.26 | [Commit d201228](https://github.com/bergwald/sopra-fs26-group-13-server/commit/d201228073694d7c24b16faa72f2cc4a6dccabb0) | Added a function to compute a score based on the distance | Scores are a key mechanism of the geography guessing game |
| **@plaiimade**     | 04.04.26 | [Commit ade92b9](https://github.com/bergwald/sopra-fs26-group-13-client/commit/ade92b9d2db6443346f124f83765a17064cbc625) | Overworked logic of login page | Now we can use the exact same login API, as already implemented in M1 |
|                    | 05.04.26 | [Commit dd92704](https://github.com/bergwald/sopra-fs26-group-13-client/commit/dd92704926fc33c93c0a91ecf8f5e26973c847fb) | Added Register frontend page, slightly tweaked frontend API logic (RegisterRequest) and removed global siteheader | New page added, also the page works as a great basis that will work with a slightly tweaked API (with field "name" removed) |

---

## Contributions Week 3 - 06.04.2026 to 12.04.2026

***Easter Break***

---

## Contributions Week 4 - 13.04.2026 to 19.04.2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@plaiimade**     | 06.04.26 | [Commit 30d9b0c](https://github.com/bergwald/sopra-fs26-group-13-client/commit/30d9b0ca93ef519d653e661dbe2cf877f26dbe59) | Added HTML and CSS for profile page (users/{id}), also logic for ranks and mascots. Laid the foundation for the profile page to work with a slighty tweaked API. | Added the next frontend page (profile page) and basis for it to work with tweaked API. |
|                    | 07.04.26 | [Commit 432f4b6](https://github.com/bergwald/sopra-fs26-group-13-client/commit/432f4b6450772c4af1c1855fd419f8cad9419858) | Added HTML and CSS for profile settings page, also tried to do the logic of how the site could work, but there a some things that might change in the future. | Added next page (profile settings) and first steps for the API logic. |
| **bergwald**       | 19.04.26 | [Commit 77e664a](https://github.com/bergwald/sopra-fs26-group-13-server/commit/77e664aaa334c2228c8eee55b86b54db38d09ca7) | Added a backend service to select a panorama location for a game round and added a temporary route to be able to test it from the frontend. | We need to be able to select an appropiate panorama to display to the user. |
|                    | 19.04.26 | [Commit 1563187](https://github.com/bergwald/sopra-fs26-group-13-client/commit/156318739bb6571e3506c2b47ffaf97b64634e08) | Created a React component to display Google Street View panoramas in the frontend and integrated the component in the demo page. | Viewing a panorama is a central part of the game. |
| **@juliand924**    | 18.04.26 | [Commit 3306587](https://github.com/bergwald/sopra-fs26-group-13-server/commit/33065879888f082b450b3fff31934c5fb26c374a) | Add an additional attribute to the user session to see who is the owner and and which are the players. |To distinguish in the lobby the owner, which can start the game and the player, which cannot start a game. |
|                    | 13.04.26 | [Commit 703ea87](https://github.com/bergwald/sopra-fs26-group-13-server/commit/703ea8763f37aa6111f285f6c17b07aac105714d) | Added authentication to the session endpoints and added all the integration tests. | It is important, that only users, which are logged in and have a valid token, are able to get the sessions, create or join one. |
| **@PAKaeser**      | 19.04.26 | [Commit bb3ef21](https://github.com/bergwald/sopra-fs26-group-13-server/commit/bb3ef2184846e00d27157f1456bf80a5625f7ec8) | responds to REST to GET on /game_data by handing back a DTO with correct URL | Frontend uses this object to know which image to get to display, so User can see which location to guess. |
|                    | 19.04.26 | [Commit 66ef9a2](https://github.com/bergwald/sopra-fs26-group-13-server/commit/66ef9a27b301084ab8cb079dd939edde80061205) | response to PUT on /submit_guess by saving additional score to DB and responding with actual location coordinates and score | User can see the actual location on the map and can see how he scored based on the response of the PUT request |

---

## Contributions Week 5 - 20.04.2026 to 26.04.2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **plaiimade**      | 15.04.26 | [Commit 056a2a5](https://github.com/bergwald/sopra-fs26-group-13-client/commit/056a2a5d38b8770bbfdfab05297f38037d668eb0) | Added gamepage HTML and CSS | Added game page so others can start implementing game features and include them in the site (e.g. the map and streetview picutes) |
|                    | 17.04.26 | [Commit 2b10cea](https://github.com/bergwald/sopra-fs26-group-13-client/commit/2b10cea53b9405cbbc89989d50be87e769c8bc7b) | Added homepage HTML and CSS | Layed foundation for our homepage, with a few API tweaks and default removals, the homepage can quickly be completed |
| **@PAKaeser**      | 21.04.26 | [Commit c4d0c46](https://github.com/bergwald/sopra-fs26-group-13-client/commit/c4d0c4623e2e9bada06a4ce5376dedd5a31b579c) | Added the map to make guesses, using leaflet from OpenStreetMap | Allows User to make a guess, saves location coordinates to later send to backend. |
|                    | 22.04.26 | [Commit b17d22a](https://github.com/bergwald/sopra-fs26-group-13-client/commit/b17d22a963e36e1f86c808a3ceed52136bc905c1) | Added embeded map and mark where correct location of mountain is | The user can see the solution and can learn from that. |
| **@juliand924**    | 22.04.26 | [Commit 8143df9](https://github.com/bergwald/sopra-fs26-group-13-client/commit/8143df9666f65217de5a5c0e32d3f26ce1666355) | Core functionality of multiplayer implementation | Added core functionality of joining a game lobby and polling of users in the lobby. Moreover core multiplayer logic was implemented such that only the owner of the lobby can start a increase the round number. Additionally polling of the game rounds were added to facilitate syncing the proceeding of rounds. |
|                    | 22.04.26 | [Commit 365a050](https://github.com/bergwald/sopra-fs26-group-13-server/commit/365a050db16ede355792212f7d12f89d94b8b9ee) | Multiplayer sync functionality backend | This is a core part of our solution, which enables users, according to their role, to start a game and increase the round numbers. This also introduced a new API endpoint, that only an owner of a session can increase a game round. Thus, these implemented changes let the game rounds sync across all players in the same session. |
| **@bergwald**      | 20.04.26 | [Commit 26546bc](https://github.com/bergwald/sopra-fs26-group-13-server/commit/26546bc38ac57e454e6d8f6dcfef83c1c296334f) | Remove field "name" from the table of users and require authentication for GET /users/[userid] | Last tweaks needed to integrate the frontend with the backend for all auth (register/login/logout) |
|                    | 20.04.26 | [Commit 5d88c66](https://github.com/bergwald/sopra-fs26-group-13-client/commit/5d88c66390e2921baab1cf3db9d6c4918ae2a400) | Integrate login/register/logout routes with the backend and protect /users/[id] pages from unauthenticated requests | Integration of the frontend with the backend API for authentication (register/login/logout) |

---

## Contributions Week 6 - 27.04.2026 to 03.05.2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **plaiimade**      | 22.04.26 | [Commit 760fa60](https://github.com/bergwald/sopra-fs26-group-13-client/commit/760fa6047f87093dd6d5a564b516d518c695628d) | Added HTML and CSS for the lobby page | So that we have a proper, goodlooking and well usable lobby |
|                    | 23.04.26 | [Commit c981d9f](https://github.com/bergwald/sopra-fs26-group-13-client/commit/c981d9f1919ff45de73159e68a5fb548c8e4c60a) | Added HTML and CSS for the results page | Same thing, but for results page. This is also now the last page that was fully added, now HTML on a decent level exists for all pages. |
| **@juliand924**    | 22.04.26 | [Commit 1a20021](https://github.com/bergwald/sopra-fs26-group-13-server/commit/1a200210a6b33fbbc173c1921c4e29fc41847dae) | Delete expired sessions and all relevant session associations. | Essential functionality to keep the data consistent. It deletes the complete session and all the associated sessions in the session_user if the request is from the user which has the owner role of this session otherwise it just deletes the session user association. |
|                    | 03.05.26 | [Commit f3e0ad5](https://github.com/bergwald/sopra-fs26-group-13-server/commit/f3e0ad555b9d285e94e74efd94be3148e9aae16f) | Persist the user guess coordination | To show the different guesses of all users in on the result page map, it is necessary to save the guesses of each user in the database. Note: This week we couldn't do a merge commit to main. Thus, the contributions are on this [branch](https://github.com/bergwald/sopra-fs26-group-13-server/compare/main...82-add-extra-column-in-database-which-contains-the-guess-of-the-user-of-the-round) from [Commit b95dc20](https://github.com/bergwald/sopra-fs26-group-13-server/commit/b95dc202de91c9aef29029259a4e44ea56b93981) to [Commit a6c254a](https://github.com/bergwald/sopra-fs26-group-13-server/commit/a6c254a95b605123a392f1dd22ac05a09afe9855). |
| **@PAKaeser**      | 23.04.26 | [Commit 5a44605](https://github.com/bergwald/sopra-fs26-group-13-server/commit/5a44605579bb5dede2002bb3921c79bd35e2dbfc) | Added Tests for GameController, GameService and UserService | lets us catch future problems with changes early + requirement SonarQube coverage |
|                    | 03.05.26 | [Commit 2b8337f](https://github.com/bergwald/sopra-fs26-group-13-client/commit/2b8337fbb4a995ad06d299c1f479da36d4b9b87c) (Client) [Commit 7d7ac52](https://github.com/bergwald/sopra-fs26-group-13-server/commit/7d7ac52f95f44cdaa239a2fb1ef897d39f670b23) (Server) | Changed the API to send back guess location, so that client side can display it together with correct location on result page. | User can see its own guess on the result page. (Task 35) |
| **@bergwald**      | 21.04.26 | [Commit e57f5e5](https://github.com/bergwald/sopra-fs26-group-13-server/commit/e57f5e5f265831afb6809ab33652c50d14f3d75b) | Activate routes for single-player gaming; deprecate the demo route /google/panorama | Needed to fully support single-player gaming in the backend |
|                    | 21.04.26 | [Commit 665bc48](https://github.com/bergwald/sopra-fs26-group-13-client/commit/665bc48ff9a23b71c5b4ef6c0b4696142321d2bd) | Wire the frontend to the backend to be able to play full single-player games | Enabled full single-player gaming in the frontend (incl. integration with backend) |

---

## Contributions Week 7 - 04.05.2026 to 10.05.2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **plaiimade**      | 07.05.26 | [Commit c5cc13e](https://github.com/bergwald/sopra-fs26-group-13-client/commit/c5cc13e7f15d86aefe7dcc294a0d5bed3490c31f) | Fixed 3 bugs alongside some other wanted pages | Bugs fixed & discussed changes made |
|                    | 08.05.26 | [Commit 6fc7bce](https://github.com/bergwald/sopra-fs26-group-13-client/commit/6fc7bce95b5aa218a8fac40522840a9d7a316bbc) | Readded mascots and profile statistics | Readded mascots for users as profile pictures and enabled profile statistics |
| **PAKaeser**       | 09.05.26 | [Commit 6a19940](https://github.com/bergwald/sopra-fs26-group-13-client/commit/6a19940801bd1a4539ae471dfa4cdfd1ff684b41) | user guesscoordinates on game page can now be between [-inf, inf], so that when map loops around, guessmarker can be set properly but is normalized when send to server | Bugfix: bevore when clicked on looped map, some arbitrary coordinates were selected, now guesses can be made on all loops of maps, but send to backend are only data in bound as expected. |
|                    | 10.05.26 | [Commit b5eb648](https://github.com/bergwald/sopra-fs26-group-13-server/commit/b5eb648281ca435d083409f17eea3cd0bf7c48e4) (server) [Commit 2768413](https://github.com/bergwald/sopra-fs26-group-13-client/commit/2768413244e1dc4c21438c8cb9720e9cab43d1f5) (client) | Changed SessionUserDetailsDTO for polling on result page, now also usernames are send. Adapted polling on client side to be able to read all guesses by all players. Then changed LeafletMap to display all points. | Now all players can see all guesses, even when other players submit their guesses later. |
| **@juliand924**    | 10.05.26 | [Commit 5c3821c](https://github.com/bergwald/sopra-fs26-group-13-server/commit/5c3821c6253e4fbc4e91809177a7b117f2534613) | Added a field to see which user already has submitted their guess. (Note: The PR merge was made by @PAKaser however I implemented this feature see [PR](https://github.com/bergwald/sopra-fs26-group-13-server/pull/111))| We want to display who already made a guess in the game. |
|                    | 10.05.26 | [Commit 7968c70](https://github.com/bergwald/sopra-fs26-group-13-server/commit/7968c70d8b14382cbff61fa17625f75682509258) | Added additional parameter to select region where to play. | We want to select the region where the mountains are displayed. Thus, this contributions adds the endpoint and the logic for the geographical area. |
| **@bergwald**      | 07.05.26 | [Commit 9d4780f](https://github.com/bergwald/sopra-fs26-group-13-server/commit/9d4780f4caebf2f3c4a7cdf257339d96025d5c49) | Remove auth on GET /users/[userId] route, add avatar integration, store and return per-user game statistics, remove "status" field.  | Required to support avatars (including updates) and retrieve data for the leaderboard and user profile pages from the backend. |
|                    | 10.05.26 | [Commit 0c6ed00](https://github.com/bergwald/sopra-fs26-group-13-server/commit/0c6ed00c61cf37c08213822ca7583be10453c704) and [Commit 49e7d2a](https://github.com/bergwald/sopra-fs26-group-13-client/commit/49e7d2affba0dcbfd570cb279e836745a41850b4) | Remove game timers and fix round timers. | Game timers are redundant and we have decided to remove them. Session timers are still relevant, but did not work. This contribution fixes this functionality. |

---

## Contributions Week 8 - 11.04.2026 to 17.04.2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@bergwald**      | 11.05.26 | [Commit cb78801](https://github.com/bergwald/sopra-fs26-group-13-server/commit/cb78801aa9daf41298b315278d5d09b9b29f1b45) (backend) and [Commit 29f99b9](https://github.com/bergwald/sopra-fs26-group-13-client/commit/29f99b9c9cb64a66cd460171f9a501851a29819d) (frontend) | Fix an auto-timeout bug with the round timer by making session timestamps unambiguous on the API boundary (format timestamps as UTC instants with Z). | The timer would auto-timeout when the server and backend were configured with different timezones, making play impossible. |
|                    | 11.05.26 | [Commit 3c78342](https://github.com/bergwald/sopra-fs26-group-13-server/commit/3c78342d3bb112a6250cbd870b040f4f5abe43be) | Change `avg_score` to `score` (compute cumulative score instead of per-round average) | We decided that a cumulative instead of a per-round average score would be better to display on the leaderboard. |
|                    | 12.05.26 | [Commit 510ab2f](https://github.com/bergwald/sopra-fs26-group-13-client/commit/510ab2f906a455e0f6bf9b2243e8625bac4f3dbe) | Improve homepage design; fix bug in results page when the user does not submit a guess. | The homepage design was boring and unattractive. When a user did not make a guess, a random pin was still displayed on the map and the distance was indicated as "-1 km". |
| **@PAKaeser** | 14.05.26   | [Commit e68a813](https://github.com/bergwald/sopra-fs26-group-13-client/commit/e68a813312a7a022f4bb5d0499bd08286bf6483d) [Commit 010b0d5](https://github.com/bergwald/sopra-fs26-group-13-client/commit/010b0d5f4c8c760859800f64efa777c42891e717)| Fixed Bug: Owner of Multiplayer game could progress to next round without all players having guessed. Resolved Build error and merge conflict: Bugfix with not displaying "empty" guesses conflicted with rendering all guesses.  | Bug fix in frontend, gameplay remains fair.  |
|                    | 14.05.26   | [Commit 343878f](https://github.com/bergwald/sopra-fs26-group-13-client/commit/343878fe9ee4c96b75d1da7dec44a0c82fc6922c) (frontend) [commit 1ca095e](https://github.com/bergwald/sopra-fs26-group-13-server/commit/1ca095ee492707814d4523dfbcd9f29bf35f98db) (backend)| Resultpage now also has a Leaderboard, that updates after each guess of the players, it displays all players of session, ranked in descending score | Feature: during game, information about score of other players is shown, makes game competitive. |
| **@juliand924** | 14.05.26   | [Commit 0773f3e](https://github.com/bergwald/sopra-fs26-group-13-server/commit/0773f3e0e9120c237ac2d8a665fd1a6282cf82de) | Users couldn't leave the multiplayer lobby properly. | Users should be able to leave a lobby and there should be logic in place, where if the lobby owner leaves, the ownership should be passed on to another member. |
|                    | 14.05.26   | [Commit aeffc77](https://github.com/bergwald/sopra-fs26-group-13-server/commit/aeffc77c3c16d9e339ef21d37c2ef8b0b61382f8) | Added capability to use a short form of the session id to join. | The previous session id, on which the user could join a game was very complex (36 characters) now its 5 characters long. |
| **@plaiimade** | 13.05.26   | [Commit 6123759](https://github.com/bergwald/sopra-fs26-group-13-client/commit/6123759b0ed314ff7a7ef1fed23a3d28d0563686) | Added the global leaderboard | Now the homepage is complete and the page finished |
|                    | 14.05.26   | [Commit f4fae9d](https://github.com/bergwald/sopra-fs26-group-13-client/commit/f4fae9d1c55c0772a784474dfc651fed816c5e95), [Commit cbeedd5](https://github.com/bergwald/sopra-fs26-group-13-client/commit/cbeedd5a45e26a5846b36409138b5ea8c555a00b), [Commit aec441d](https://github.com/bergwald/sopra-fs26-group-13-client/commit/aec441d66e5f3eb5a9897ccb1bb9627264a11778) | Made all authentication checks & redirects consistent (still ongoing, couple of other merges belong to that aswell) | Consistency and safety across frontend pages |

---

## Contributions Week 9 - 18.04.2026 to 24.04.2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@bergwald**      | 13.05.26 | [Commit 5867c84](https://github.com/bergwald/sopra-fs26-group-13-client/commit/5867c84802f468eb3dbffa4b184692a531f33371) (frontend) and [Commit f62cb06](https://github.com/bergwald/sopra-fs26-group-13-server/commit/f62cb06bc14b79286bb7b921af5ddd5a93d2ffc8) (backend) | Fix bug stemming from invalid credentials: validate authentication credentials with a new GET /auth/validate route. | The frontend did not validate if a user's credentials were valid. As a result, a user with outdated credentials (e.g. because of a restart of the backend) would have to manually clear his local storage. |
|                    | 13.05.26 | [Commit d246c31](https://github.com/bergwald/sopra-fs26-group-13-client/commit/d246c312aea78bf9def129cde1245d37294f4b75) | Detect failed Google Street View tile/resource loads (429 HTTP errors) and show a clear error message when imagery cannot render. | We noticed that in some cases, the Google Street View API fails to load with a 429 HTTP error. We now display a clear error message when this happens. |
| **@plaiimade** | 15.05.26   | [Commit 746262e](https://github.com/bergwald/sopra-fs26-group-13-client/commit/746262e7a09f5bf7459b3d5933de2ee2c5ca541b) | Added region picker | Last functionality added, site now complete |
|                    | 21.05.26   | [Commit 87a0288](https://github.com/bergwald/sopra-fs26-group-13-client/commit/87a02884fd9a345fd1f8d015c1b4deea0538897b), [Commit 5d64093](https://github.com/bergwald/sopra-fs26-group-13-client/commit/5d6409371712b3296c7b85572e4b18134ec1ad6d), [Commit a549ec9](https://github.com/bergwald/sopra-fs26-group-13-client/commit/a549ec986885ad4ad2f6848fc480b817aed3da5d) | UI fixes and redirect/frontend behaviour fixes | So that mobile version looks better and pages handle all cases correclty |
| **@juliand924** | 18.05.26   | [Commit 2c21118](https://github.com/bergwald/sopra-fs26-group-13-server/commit/2c21118d23f1ac3b21bc272c975ece7b48a233f8), [Commit bf75a89](https://github.com/bergwald/sopra-fs26-group-13-server/commit/bf75a8921a8ee86e79bbfe1169c3993f957b791a), [Commit c93e3f2](https://github.com/bergwald/sopra-fs26-group-13-server/commit/c93e3f2ccb9cde623bc1b64a577195ecfbd74322), [Commit c93e3f2](https://github.com/bergwald/sopra-fs26-group-13-server/commit/c93e3f2ccb9cde623bc1b64a577195ecfbd74322), [Commit cca616a](https://github.com/bergwald/sopra-fs26-group-13-server/commit/cca616aee46416bf912e0b9302b3456360155fcc), [Commit 3988d94](https://github.com/bergwald/sopra-fs26-group-13-server/commit/3988d94a861dbe1737d103e53097819df91ae673) | Updated bounding boxes for the regions to avoid using the elevation API endpoint. Note 2 group members worked on this issue the merge commit to this issue: [Merge Commit 34d4348](https://github.com/bergwald/sopra-fs26-group-13-server/commit/34d4348e7dd837bfb6d5514df72e74fb338214f3) | The game mechanic (guessing on regions with mountains or above 1200m elevation) needs good bounding boxes of the regions. |
|                    | 20.05.26   | [Commit b7e8452](https://github.com/bergwald/sopra-fs26-group-13-client/commit/b7e8452f637c1b47afb4df38f17d059797c9e61b) | Fixed bug in which the timer didn't reset correctly. | If the user was navigating between sites (e.g. landing page, result page etc.) while the user was playing a game before, the user would always get a time out error when the user tried to create a new game. |
| **@PAKaeser** | 18.05.26   | [Commit ba1d981 (Andes)](https://github.com/bergwald/sopra-fs26-group-13-server/commit/ba1d9817fef91fc95a9ae2837a6849d576e95bc8), [Commit 59a2071 (NewZeeland)](https://github.com/bergwald/sopra-fs26-group-13-server/commit/59a2071ecb3b2582642d3ebb9b4f21996f67efc0) [Commit fb387fa (Tests)](https://github.com/bergwald/sopra-fs26-group-13-server/commit/fb387fa3cb508c5736dbd6a8f4af6a72b62e9ece) | Updated bounding boxes for the regions to avoid using the elevation API endpoint. Note: 2 group members worked on this issue the merge commit to this issue: [Merge Commit 34d4348](https://github.com/bergwald/sopra-fs26-group-13-server/commit/34d4348e7dd837bfb6d5514df72e74fb338214f3) | The game mechanic needs accurate bounding boxes of the regions, where locations to guess can be. |
|                    | 21.05.26   | [Commit 81aac8f](https://github.com/bergwald/sopra-fs26-group-13-client/commit/81aac8fe7884ea8ae9f9b13b6768de4cd0206d78) | removed check on resultpage for polling if it is last round | Bug fix: In last round, no polling happened (original purpose: check if owner progressed round, for last round results not needed), now polling is enabled for last round too, so that all guesses of all players can be fetched and displayed.  |
