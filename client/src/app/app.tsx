import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Ticket, User } from "@acme/shared-models";

import styles from "./app.module.css";
import Tickets from "./tickets/tickets";
import TicketDetails from "./ticket-details/ticket-details";
const App = () => {
	const [tickets, setTickets] = useState([] as Ticket[]);
	const [users, setUsers] = useState([] as User[]);
	const [loading, setLoading] = useState(false);

	// Very basic way to synchronize state with server.
	// Feel free to use any state/fetch library you want (e.g. react-query, xstate, redux, etc.).
	useEffect(() => {
		let didCancel = false;
		setLoading(true);
		function fetchTickets() {
			fetch("/api/tickets")
				.then(res => res.json())
				.then(json => {
					if (!didCancel) {
						setTickets(json);
					}
				}).then(() => {
					if (!didCancel) {
						setLoading(false);
					}
				});
		}

		function fetchUsers() {
			fetch("/api/users")
				.then(res => res.json())
				.then(json => {
					if (!didCancel) {
						setUsers(json);
					}
				});
		}

		fetchTickets();
		fetchUsers();
		return () => {
			didCancel = true;
		};
	}, []);
	return (
		<div className={styles["app"]}>
			<Routes>
				<Route
					path="/"
					element={
						<Tickets
							tickets={tickets}
							users={users}
							loading={loading}
						/>
					}
				/>
				{/* Hint: Try `npx nx g component TicketDetails --project=client --no-export` to generate this component  */}
				<Route
					path="/detail/:id"
					element={<TicketDetails />}
				/>
			</Routes>
		</div>
	);
};

export default App;
