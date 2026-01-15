import styles from "./ticket-details.module.css";
import { useParams } from "react-router-dom";
import { ChangeEvent, useEffect, useState, useRef } from "react";
import { Ticket, User } from "@acme/shared-models";
import { Button, Chip, IconButton, MenuItem, Skeleton, Select, Snackbar } from "@mui/material";
import { NavigateBefore, Add, Remove, Check, RemoveDone } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

/* eslint-disable-next-line */
export interface TicketDetailsProps {
	users: User[];
}

interface Snack {
	open: boolean;
	message: string;
	autoHideDuration: number;
}

export function TicketDetails(props: TicketDetailsProps) {
	const navigate = useNavigate();
	let currentUserID = useRef(null);
	const [loading, setLoading] = useState(false);
	const [refetchLoading, setRefetchLoading] = useState(false);
	const [ticket, setTicket] = useState({} as Ticket);
	const [snackBar, setSnackbar] = useState({
		open: false,
		message: "",
		autoHideDuration: 3000,
	} as Snack);
	const { id } = useParams();

	function onShowSnackbar(message: string): void {
		setSnackbar(prev => ({
			...prev,
			message: message,
			open: true,
		}));
	}

	function onCloseSnackbar(): void {
		setSnackbar(prev => ({
			...prev,
			message: "",
			open: false,
		}));
	}

	function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any, key: string) {
		if (!e) return;
		setTicket(prev => ({
			...prev,
			[key]: e.target.value,
		}));
	}

	function navigateBack(): void {
		navigate(-1);
	}

	function addTicket() {
		fetch("/api/tickets", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				description: ticket?.description,
			}),
		}).then(() => {
			onShowSnackbar("Ticket added!");
		});
	}

	function assignUser() {
		fetch(`/api/tickets/${ticket.id}/assign/${ticket.assigneeId}`, {
			method: "PUT",
		}).then(() => {
			const userName = props?.users?.find(p => p.id === ticket.assigneeId)?.name;
			onShowSnackbar(`${userName} assigned!`);
			fetchTicketsByID();
		});
	}

	function unassignUser() {
		fetch(`/api/tickets/${ticket.id}/unassign`, {
			method: "PUT",
		}).then(() => {
			const userName = props?.users?.find(p => p.id === currentUserID.current)?.name;
			onShowSnackbar(`${userName} unassigned!`);
			fetchTicketsByID();
		});
	}

	function onComplete() {
		fetch(`/api/tickets/${ticket.id}/complete`, {
			method: "PUT",
		}).then(() => {
			onShowSnackbar("Ticket completed!");
			fetchTicketsByID();
		});
	}

	function onReject() {
		fetch(`/api/tickets/${ticket.id}/complete`, {
			method: "DELETE",
		}).then(() => {
			onShowSnackbar("Ticket marked as uncompleted!");
			fetchTicketsByID();
		});
	}

	let didCancel = false;
	function fetchTicketsByID(isInititalLoad: boolean = false) {
		if (isInititalLoad) {
			setLoading(true);
		} else {
			setRefetchLoading(true);
		}
		fetch(`/api/tickets/${id}`)
			.then(res => res.json())
			.then(json => {
				if (!didCancel) {
					setTicket(json);
					currentUserID.current = json?.assigneeId;
				}
			})
			.then(() => {
				if (!didCancel) {
					if (isInititalLoad) {
						setLoading(false);
					} else {
						setRefetchLoading(false);
					}
				}
			});
	}

	useEffect(() => {
		if (id !== undefined) {
			fetchTicketsByID(true);
		}

		return () => {
			didCancel = true;
		};
	}, []);
	return (
		<div>
			<div className={styles["detail-header"]}>
				<IconButton onClick={navigateBack}>
					<NavigateBefore />
				</IconButton>
				{loading ? (
					<Skeleton
						width={150}
						variant="text"
						sx={{
							fontSize: "1.5rem",
						}}
					/>
				) : (
					<div className="flex align-center">
						{id ? (
							<>
								<h2 className="mgr-0-5rem">{ticket.description}</h2>
								<Chip
									size="small"
									color={ticket.completed ? "success" : "info"}
									label={ticket.completed ? "Complete" : "Ongoing"}
									style={{
										marginRight: "0.5rem",
									}}
								/>
								{currentUserID.current === null && (
									<Chip
										size="small"
										label="Unassigned"
									/>
								)}
							</>
						) : (
							<h2>Create new ticket</h2>
						)}
					</div>
				)}
			</div>
			<div className={styles["detail-body"]}>
				{!id && (
					<>
						<label htmlFor="description">Description</label>
						<input
							className={styles["detail-body-assigned"]}
							placeholder="Enter description"
							name="description"
							value={ticket.description}
							onChange={e => handleChange(e, "description")}
						/>
					</>
				)}
				{id &&
					(currentUserID.current ? (
						<>
							<label htmlFor="assigned">Current Assigned User</label>
							<input
								className={styles["detail-body-assigned"]}
								placeholder="Assigned"
								name="assigned"
								value={props?.users?.find(p => p.id === currentUserID.current)?.name || ""}
								disabled={true}
							/>
						</>
					) : (
						<>
							<p>User List</p>
							<Select
								value={ticket.assigneeId || null}
								onChange={e => handleChange(e, "assigneeId")}
								variant="outlined"
								style={{
									marginBottom: 8,
								}}
							>
								{props.users
									? props.users
											.filter(p => p.id !== currentUserID.current)
											.map(u => (
												<MenuItem
													key={u.id}
													value={u.id}
												>
													{u.name}
												</MenuItem>
											))
									: null}
							</Select>
						</>
					))}
			</div>
			<div className={styles["detail-footer"]}>
				{id ? (
					<>
						{!ticket.completed ? (
							<>
								<div className={styles["detail-button"]}>
									<Button
										loading={loading || refetchLoading}
										style={{
											textTransform: "capitalize",
										}}
										fullWidth
										variant="contained"
										onClick={assignUser}
										endIcon={<Add />}
										disabled={!ticket.assigneeId || currentUserID.current === ticket.assigneeId}
									>
										Assign
									</Button>
								</div>
								<div className={styles["detail-button"]}>
									<Button
										loading={loading || refetchLoading}
										style={{
											textTransform: "capitalize",
										}}
										fullWidth
										variant="contained"
										onClick={unassignUser}
										endIcon={<Remove />}
										disabled={!currentUserID.current}
									>
										Unassign current user
									</Button>
								</div>
								<div className={styles["detail-button"]}>
									<Button
										loading={loading || refetchLoading}
										style={{
											textTransform: "capitalize",
										}}
										fullWidth
										variant="contained"
										onClick={onComplete}
										endIcon={<Check />}
										color="success"
										disabled={!currentUserID.current}
									>
										Mark as complete
									</Button>
								</div>
							</>
						) : (
							<div className={styles["detail-button"]}>
								<Button
									loading={loading || refetchLoading}
									style={{
										textTransform: "capitalize",
									}}
									fullWidth
									variant="contained"
									onClick={onReject}
									endIcon={<RemoveDone />}
									color="error"
								>
									Mark as uncomplete
								</Button>
							</div>
						)}
					</>
				) : (
					<div className={styles["detail-button"]}>
						<Button
							loading={loading || refetchLoading}
							style={{
								textTransform: "capitalize",
							}}
							fullWidth
							variant="contained"
							onClick={addTicket}
							endIcon={<Add />}
							disabled={!ticket.description}
						>
							Create Ticket
						</Button>
					</div>
				)}
			</div>
			<Snackbar
				open={snackBar.open}
				autoHideDuration={snackBar.autoHideDuration}
				message={snackBar.message}
				onClose={onCloseSnackbar}
			/>
		</div>
	);
}

export default TicketDetails;
