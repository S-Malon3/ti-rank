import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';

import { Player } from 'js/Player.js'
import './PlayerDetails.css';
import { doc, getDoc } from "firebase/firestore";

	// === Hooks === //
    
	const usePlayer = (groupId, playerName) => {
		const [player, setPlayer] = useState(null);
		const [loading, setLoading] = useState(true);

		const fetchPlayer = async () => {
			setLoading(true);
			try {
				const playerData = await Player.fromFirestore(groupId, playerName);
				setPlayer(playerData);
			} catch (error) {
				console.warn("error.message");
				setPlayer(null);
			} finally {
				setLoading(false);
			}
		}
		useEffect(() => {
			fetchPlayer();
		}, [groupId, playerName]);
		return { player, loading, refresh: fetchPlayer };
	}

function PlayerDetails() {
	const { groupId, playerName } = useParams();
	const { player, loading, refresh } = usePlayer(groupId, playerName);
	const { refreshSidebar } = useOutletContext();
	const navigate = useNavigate();

	//navigate back if player doesn't exist
	useEffect(() => {
		if (!loading && player === null) {
			navigate(-1);
		}
	}, [loading, player, navigate, groupId]);

	//form elements
	const [formVals, setFormVals] = useState("");

	if(!player) {
		return null;
	}

	const handleChange = (event) => {
		const name = event.target.name;
		const value = event.target.value;
		setFormVals(values => ({...values, [name]: value}))

	}

	const handleSubmit = async (event) => {
		event.preventDefault();
		await player.setName(formVals.name);
		await player.setRank(Number(formVals.rank));
		await player.setGameCount(Number(formVals.gameCount));
		navigate("/"+groupId+"/"+formVals.name, {replace: true});
		if (refreshSidebar.current) {
			refreshSidebar.current();
		}
		refresh();
	}

	// === HTML === //	
	
	return (
		<div className="PlayerDetails">
			<form onSubmit={handleSubmit}>
				<h1>{player.name}</h1>
				<div className="PlayerDetailRow">
					<p/>
					<p>change name:</p>
					<input type="text" name="name" value={formVals.name || ""} onChange={handleChange}/>
				</div>
				<div className="PlayerDetailRow">
					<p>Player Rank: {player.rank}</p>
					<p>change rank:</p>
					<input type="text" name="rank" value={formVals.rank || ""} onChange={handleChange}/>
				</div>
				<div className="PlayerDetailRow">
					<p>Player Games: {player.gameCount}</p>
					<p>change Game Count:</p>
					<input type="text" name="gameCount" value={formVals.gameCount || ""} onChange={handleChange}/>
				</div>
				<div className="PlayerDetailRow">
					<p/><p/><input type="submit" value="submit"/>
				</div>
			</form>
		</div>
	);
}

export default PlayerDetails;
