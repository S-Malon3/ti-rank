import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from 'js/firebaseConfig.js';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import './Sidebar.css'
import { getRankColor } from 'js/getRankColor';
import { Player } from 'js/Player';

// === Hooks === //

// query Firestore and log the results
const getPlayers = async (group) => {
	try {
		const querySnapshot = await getDocs(collection(db, `/Groups/${group}/Players`));
		const ranked = []; //ranked meaning they have 3 or more games recorded
		const unranked = []; //unranked meaning they have less then 3 games recorded
			
		let playerData = await Player.fromFirestoreQuerySnapshot(querySnapshot, group);

		playerData.forEach((player) => {
			if (player.gameCount >= 3) {
				ranked.push(player);
			} else {
				unranked.push(player);
			}
		});
		return { ranked, unranked };
	} catch (error) {
		console.error("Error querying Firestore: ", error);
	}
};

const usePlayers = (groupId) => {
	const [rankedPlayers, setRankedPlayers] = useState([]);
	const [unrankedPlayers, setUnrankedPlayers] = useState([]);

	const fetchPlayers = async () => {
		const players = await getPlayers(groupId)

		if(!players) {
			console.warn("getPlayers returned undefined");
		}

		const { ranked, unranked } = players;;

		//sort out players by rank
		ranked.sort((a, b) => b.rank - a.rank);
		unranked.sort((a, b) => {
			if (b.gameCount !== a.gameCount) {
				return b.gameCount - a.gameCount;
			}
			return b.rank - a.rank;
		});
		setRankedPlayers(ranked);
		setUnrankedPlayers(unranked);
	}

	useEffect(() => {
		fetchPlayers();
	}, []);

	return { rankedPlayers, unrankedPlayers, refresh: fetchPlayers};
}

// === Component === //

function Sidebar({ group, callback: callbackRefreshPlayerSidebar }) {
	const { groupId } = useParams()
	const { rankedPlayers, unrankedPlayers, refresh} = usePlayers(groupId);

	useEffect(() => {
		if (typeof callbackRefreshPlayerSidebar === 'function') {
			callbackRefreshPlayerSidebar(refresh);
		} else {
			console.log("ERROR");
		}
	}, [refresh]);
	// === Scripts === //

	const formatNumberWithCommas = (number) => { //TODO: Probably make this its own js/ file bc i'll need it elsewhere
		return new Intl.NumberFormat('en-US').format(number)
	};

	const navigate = useNavigate()

	const handleNavigate = (playerID) => {
		navigate(`./${playerID}`);
	}

	// === HTML === //
	
	return (
		<div className="sidebar">
			<div className="sidebarHeader">
				Ranks
			</div>

			{rankedPlayers.map((player, index) => {
				let rankColor = getRankColor(player.rank);
				const isEvenRow = index % 2 === 0;

				rankColor = isEvenRow ? rankColor : rankColor.concat("-dark")
					  
				return (
					<div key={player.name} className={`player-box ${rankColor}`} onClick={() => handleNavigate(player.name)}>
						<span className="player-name">{player.name}</span>
						<span className="player-rank">{formatNumberWithCommas(player.rank)}</span>
					</div>
				);
			})}

			{unrankedPlayers.length > 0 && (
				<>
					<div className="sidebarHeader">
						<span className="sidebarHeader-left">Unranked</span>
						<span className="sidebarHeader-subtext">games until rank</span>
					</div>
					{unrankedPlayers.map((player, index) => {
						const isEvenRow = index % 2 === 0;
						const rankColor = isEvenRow ? "unranked" : "unranked-dark"

						return (
							<div key={player.name} className={`player-box ${rankColor}`} onClick={() => handleNavigate(player.name)}>
								<span className="player-name">{player.name}</span>
								<span className="player-rank">{formatNumberWithCommas(player.rank)}</span>
								<span className="player-rank">{3-player.gameCount}</span>
							</div>
						);
					})}
				</>
			)}
		</div>
	);
}

export default Sidebar;
