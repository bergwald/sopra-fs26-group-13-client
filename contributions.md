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
| **@PAKaeser** | 28.03.26   | [Commit 6b79421](https://github.com/bergwald/sopra-fs26-group-13-server/commit/6b794219c04df89b36e11aed6de7904e42dea3ad) | Added a Entity for database representation for game info per round and session | Lets us keep track of game infos like image url or round. |
|                    | 28.03.26   | [Commit cffae0a](https://github.com/bergwald/sopra-fs26-group-13-server/commit/cffae0a9b9dc8728a57d66270dbb2a8c9f7cd8d6) | Added DTO for game data obj and mapper | Needed for response for GET request during game for each round. |
| **@juliand924** | 28.03.26   | [Commit 8797212](https://github.com/bergwald/sopra-fs26-group-13-server/commit/87972123c81933bc8a0805a0d123541724452980) | Added initially the classes for the session controller and service | The session controller and service are needed for handling the game session |
|                    | 28.03.26   | [Commit 9c1e490](https://github.com/bergwald/sopra-fs26-group-13-server/commit/9c1e490bd8d3167b4e227a961c1e39c3dd7178a5) | Added Session object which represents the session table in our database | Defines the structure how the session is handled in the database. |
| **@plaiimade** | 29.03.26  | [Commit 34464cc](https://github.com/bergwald/sopra-fs26-group-13-client/commit/34464cc14f4e90ec1c4b6842e1e2b4d90f71aeae) | Added all blank page folders and files in the frontend | Gives us the underlying structure of the frontend, to continue completing it in the coming weeks |
|                    | 29.03.26   | [Commit a6b06a7](https://github.com/bergwald/sopra-fs26-group-13-client/commit/a6b06a74bc0a61222f271576ec7d5ab36564c075) | Added proper HTML of first page (/login), serves as inspiration of how the pages will most likely look like | Serves as a visualization of how the frontend pages will look like and means first page is implemented |
| **@bergwald** | 25.03.26   | [Commit 0a89f92](https://github.com/bergwald/sopra-fs26-group-13-server/commit/0a89f927e4b91f3a5adc9369b96f239e04f108f6) | Updated the database tables to ensure that the username is not updatable | Ensures that the username cannot be updated, which is a requirement of one of our user stories. |
|                 | 25.03.26   | [Commit e45d341](https://github.com/bergwald/sopra-fs26-group-13-server/commit/e45d3411c4de502e25abec458d5dae7f2b187686) | Updated the /users/{userId} route such that the bio of a user can be changed. | Allows a user to update his bio through his own profile page. |

---

## Contributions Week 2 - 30.03.2026 to 05.04.26

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@PAKaeser** | 05.04.26   | [Commit 3e49c48](https://github.com/bergwald/sopra-fs26-group-13-server/commit/3e49c488712fa25181142a2c2d833011324abae3) | Added GameDataRepository | Lets us save gamedata persistent |
|                    | 05.04.26   | [Commit da1f1e6](https://github.com/bergwald/sopra-fs26-group-13-server/commit/da1f1e62754444e86ce301232e183e805aa0b65e) | added Tests for GameDataRepository | Checks functionality of Repository (findByDataId) and fulfills SonarQube coverage percentage |
| **@juliand924** | 05.04.26   | [Commit 0f9ff8e](https://github.com/bergwald/sopra-fs26-group-13-server/commit/0f9ff8e97da729fbd6a8dd195c02d0a781054569) | Added the session user repository and added the functionality that a user can join a session. | The repository is needed for the CRUD operations with the "sessionuser" table which holds the information which user is in which session. This further entails that a user can join a session which was added also in this commit. |
|                    | 03.04.26   | [Commit b531850](https://github.com/bergwald/sopra-fs26-group-13-server/commit/b53185048f044d33b7f21c0fbd2a024c03dd994c) | Initially adding the table for handling the user and session | This table is needed to map a user to a geo guesser session. In this table the scores of each of the user will also be tracked. |
| **@bergwald** | 05.04.26   | [Commit af85010](https://github.com/bergwald/sopra-fs26-group-13-server/commit/af85010e49764edad174122eb80a1025d8e08148) | Added a function to compute the distance between the guessed and actual location | Needed to compute a score for the guessed location and to give feedback to the player |
|                    | 05.04.26   | [Commit d201228](https://github.com/bergwald/sopra-fs26-group-13-server/commit/d201228073694d7c24b16faa72f2cc4a6dccabb0) | Added a function to compute a score based on the distance | Scores are a key mechanism of the geography guessing game |
| **@plaiimade** | 04.04.26   | [Commit ade92b9](https://github.com/bergwald/sopra-fs26-group-13-client/commit/ade92b9d2db6443346f124f83765a17064cbc625) | Overworked logic of login page | Now we can use the exact same login API, as already implemented in M1 |
|                    | 05.04.26   | [Commit dd92704](https://github.com/bergwald/sopra-fs26-group-13-client/commit/dd92704926fc33c93c0a91ecf8f5e26973c847fb) | Added Register frontend page, slightly tweaked frontend API logic (RegisterRequest) and removed global siteheader | New page added, also the page works as a great basis that will work with a slightly tweaked API (with field "name" removed) |

---

## Contributions Week 3 - 06.04.2026 to 12.04.2026

***Easter Break***

---

## Contributions Week 4 - 13.04.2026 to 19.04.2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **@plaiimade** | 06.04.2026   | [Commit 30d9b0c](https://github.com/bergwald/sopra-fs26-group-13-client/commit/30d9b0ca93ef519d653e661dbe2cf877f26dbe59) | Added HTML and CSS for profile page (users/{id}), also logic for ranks and mascots. Laid the foundation for the profile page to work with a slighty tweaked API. | Added the next frontend page (profile page) and basis for it to work with tweaked API. |
|                    | 07.04.2026   | [Commit 432f4b6](https://github.com/bergwald/sopra-fs26-group-13-client/commit/432f4b6450772c4af1c1855fd419f8cad9419858) | Added HTML and CSS for profile settings page, also tried to do the logic of how the site could work, but there a some things that might change in the future. | Added next page (profile settings) and first steps for the API logic. |
| **bergwald** | 19.04.2026   | [Commit 77e664a](https://github.com/bergwald/sopra-fs26-group-13-server/commit/77e664aaa334c2228c8eee55b86b54db38d09ca7) | Added a backend service to select a panorama location for a game round and added a temporary route to be able to test it from the frontend. | We need to be able to select an appropiate panorama to display to the user. |
|                    | 19.04.2026   | [Commit 1563187](https://github.com/bergwald/sopra-fs26-group-13-client/commit/156318739bb6571e3506c2b47ffaf97b64634e08) | Created a React component to display Google Street View panoramas in the frontend and integrated the component in the demo page. | Viewing a panorama is a central part of the game. |
| **@juliand924** | 18.04.2026   | [Commit 3306587](https://github.com/bergwald/sopra-fs26-group-13-server/commit/33065879888f082b450b3fff31934c5fb26c374a) | Add an additional attribute to the user session to see who is the owner and and which are the players. |To distinguish in the lobby the owner, which can start the game and the player, which cannot start a game. |
|                    | 13.04.2026  | [Commit 703ea87](https://github.com/bergwald/sopra-fs26-group-13-server/commit/703ea8763f37aa6111f285f6c17b07aac105714d) | Added authentication to the session endpoints and added all the integration tests. | It is important, that only users, which are logged in and have a valid token, are able to get the sessions, create or join one. |
| **@PAKaeser** | 19.04.2026   | [Commit bb3ef21](https://github.com/bergwald/sopra-fs26-group-13-server/commit/bb3ef2184846e00d27157f1456bf80a5625f7ec8) | responds to REST to GET on /game_data by handing back a DTO with correct URL | Frontend uses this object to know which image to get to display, so User can see which location to guess. |
|                    | 19.04.2026   | [Commit 66ef9a2](https://github.com/bergwald/sopra-fs26-group-13-server/commit/66ef9a27b301084ab8cb079dd939edde80061205) | response to PUT on /submit_guess by saving additional score to DB and responding with actual location coordinates and score | User can see the actual location on the map and can see how he scored based on the response of the PUT request |

---

## Contributions Week 5 - 20.04.2026 to 26.04.2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 6 - 27.04.2026 to 03.05.2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 7 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
