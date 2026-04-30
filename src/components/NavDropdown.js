import React from 'react'
import Dropdown from 'react-bootstrap/Dropdown'

import './NavDropdown.css'

function NavDropdown() {
	return (
		<Dropdown className="nav-dropdown">
			<Dropdown.Toggle variant="link" id="nav-dropdown-toggle">
				Navigation
			</Dropdown.Toggle>

			<Dropdown.Menu>
				<Dropdown.Item className="nav-dropdown__item">New Player</Dropdown.Item>
				<Dropdown.Item className="nav-dropdown__item">New Game</Dropdown.Item>
			</Dropdown.Menu>
		</Dropdown>
	)
}

export default NavDropdown
