import styles from "./ticket-details.module.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Ticket } from "@acme/shared-models";
import { IconButton, Skeleton, Chip } from "@mui/material";
import { NavigateBefore } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

/* eslint-disable-next-line */
export interface TicketDetailsProps {}

export function TicketDetails(props: TicketDetailsProps) {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [ticket, setTicket] = useState({} as Ticket);
	const { id } = useParams();
	useEffect(() => {
		let didCancel = false;
		setLoading(true);
		function fetchTicketsByID(id: string) {
			fetch(`/api/tickets/${id}`)
				.then(res => res.json())
				.then(json => {
					if (!didCancel) {
						setTicket(json);
					}
				})
				.then(() => {
					if (!didCancel) {
						setLoading(false);
					}
				});
		}
		if (id !== undefined) {
			fetchTicketsByID(id);
		}

		return () => {
			didCancel = true;
		};
	}, []);

	function navigateBack(): void {
		navigate(-1);
	}

	return (
		<div className={styles["container"]}>
			<div className={styles["detail-header"]}>
				<IconButton onClick={navigateBack}>
					<NavigateBefore />
				</IconButton>
				{loading ? (
					<Skeleton
						width={150}
						variant="text"
						sx={{
							fontSize: "1.5rem"
						}}
					/>
				) : (
					<h2>{ticket.description}</h2>
				)}
			</div>
		</div>
	);
}

export default TicketDetails;
