import { db } from 'js/firebaseConfig.js';
import { doc, getDocs, collection, query, where, setDoc } from 'firebase/firestore';


export class Player {
	constructor(name, rank, gameCount, playerRef) {
		this.name = name;
		this.rank = rank;
		this.gameCount = gameCount;
		this.playerRef = playerRef;
	}

	static validatePlayerDetails(playerDetails) {
		if (!("Name" in playerDetails)) {
			throw new Error(`Invalid player document: Missing Name field`);
		}

		if (typeof playerDetails.Name !== "string") throw new Error("Invalid type: Name must be a string");

		if (typeof playerDetails.Rank !== "number") {
			playerDetails.Rank = 1000;
		}

		if (typeof playerDetails.GameCount !== "number") {
			playerDetails.GameCount = 0;
		}

		return playerDetails;
	}
	
	//static factory from firestore groupID and playerName
	static async fromFirestore(groupId, playerName) {
		const playerRef = collection(db, `/Groups/${groupId}/Players`);
		const q = query(playerRef, where("Name", "==", playerName));
		const playerSnap = await getDocs(q);

		if (playerSnap.empty) {
			throw new Error(`Player ${playerName} was not found in group ${groupId}`);
		}

		const playerDoc = playerSnap.docs[0]
		let playerDetails = playerDoc.data();

		playerDetails = Player.validatePlayerDetails(playerDetails);

		return new Player(
			playerDetails.Name,
			playerDetails.Rank,
			playerDetails.GameCount,
			playerDoc.ref
		);
	}

	static async fromFirestoreQuerySnapshot(querySnapshot, group) {
		if (querySnapshot.empty) {
			 console.warn(`No players found in group ${group}`);
			 return [];
		}

		let players = [];

		querySnapshot.forEach((playerDoc) => {
			try {
				//check to see if player is 
				let playerDetails = playerDoc.data();

				playerDetails = Player.validatePlayerDetails(playerDetails);

				//add player if valid
				const playerData = new Player(
					playerDetails.Name,
					playerDetails.Rank,
					playerDetails.GameCount,
					doc(db, `/Groups/${group}/Players`, playerDoc.id) //firebase player reference doc
				);
				
				players.push(playerData);
			} catch (err) {
				console.warn(`Skipping Invalid player document ${playerDoc.id}`)
			}
		});

		return players;
	}

	async setName(name) {
		try {
			setDoc(this.playerRef, {
				Name: name
			}, {merge: true});
		} catch (error) {
			console.log("Error setting rank", error);
		}
	}

	async setRank(rank) {
		try {
			setDoc(this.playerRef, {
				Rank: rank
			}, {merge: true});
		} catch (error) {
			console.log("Error setting rank", error);
		}
	}

	async setGameCount(gameCount) {
		try {
			setDoc(this.playerRef, {
				GameCount: gameCount
			}, {merge:true});
		} catch (error) {
			console.log("Error setting rank", error);
		}
	}
}
