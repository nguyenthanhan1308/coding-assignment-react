import { useReducer } from "react";
import { Ticket, User } from "@acme/shared-models";
import styles from "./tickets.module.css";
import { Add } from "@mui/icons-material";
import { Button, Chip, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
export interface TicketsProps {
	tickets: Ticket[];
	users: User[];
	loading: boolean;
}

type Filter = "All Tickets" | "Complete" | "Uncomplete" | "Assigned" | "Unassigned";;

interface TicketState {
	page: number;
	skip: number;
	filter: Filter
}

function reducer(
	state: TicketState,
	action: { type: string; nextFilter?: Filter }
): TicketState {
	const { page } = state;
	switch (action.type) {
		case "NEXT_PAGE":
			return { ...state, page: page + 1 };
		case "PREV_PAGE":
			return { ...state, page: page - 1 };
		case "CHANGE_FILTER":
			if (action.nextFilter !== undefined) {
				return { ...state, filter: action.nextFilter };
			}
			return state;
		default:
			return state;
	}
}
const filterList: Filter[] = ["All Tickets", "Complete", "Uncomplete", "Assigned", "Unassigned"];

export function Tickets(props: TicketsProps) {
	const navigate = useNavigate();
	const [state, dispatch] = useReducer(reducer, {
		page: 0,
		skip: 10,
		filter: "All Tickets",
	});
	function onCardClick(ticketID: number) {
		navigate(`/detail/${ticketID}`);
	}

	function onEnterDown(e: React.KeyboardEvent, ticketID: number) {
		if (e.key === "Enter") {
			e.preventDefault();
			onCardClick(ticketID);
		}
	}

	function onCreateTicket(): void {
		navigate("/detail");
	}

	function onNextPage(): void {
		dispatch({ type: "NEXT_PAGE" });
	}

	function onPrevPage(): void {
		dispatch({ type: "PREV_PAGE" });
	}

	function onChangeFilter(status: Filter): void {
		dispatch({type: "CHANGE_FILTER", nextFilter: status})
	}

	function filterTicket () {
		let filteredTickets = props.tickets.slice(pageFirst - 1, pageLast);
		switch(state.filter) {
			case "Assigned":
				filteredTickets = filteredTickets.filter(p => p.assigneeId !== undefined);
				break;
			case "Unassigned":
				filteredTickets = filteredTickets.filter(p => p.assigneeId === undefined);
				break;
			case "Complete":
				filteredTickets = filteredTickets.filter(p => p.completed === true);
				break;
			case "Uncomplete":
				filteredTickets = filteredTickets.filter(p => p.completed === false);
				break;
			default:
				break;
		}
		return filteredTickets
	}

	const pageFirst = filterTicket()?.length === 0 ? 0 : state.page * state.skip + 1;
	const pageLast = Math.min((state.page + 1) * state.skip, filterTicket()?.length);
	return (
		<div className="flex flex-col content-between">
			<div className={styles["ticket-header"]}>
				<div>
					<h1 className="mgb-8">Support Tickets</h1>
					<p className="mgb-8 opacity-70">Review and manage your incoming support requests.</p>
				</div>
				<div className={styles["ticket-create-button"]}>
					<Button
						style={{
							marginBottom: 16,
							textTransform: "capitalize",
						}}
						variant="contained"
						startIcon={<Add />}
						onClick={onCreateTicket}
					>
						Create Ticket
					</Button>
				</div>
			</div>
			<div className={styles["ticket-filter"]}>
				{filterList.map(status => {
					return (
						<Chip
							sx={{
								marginRight: "0.5rem"
							}}
							clickable={true}
							color={state.filter === status ? "primary" : "default"}
							label={status}
							onClick={() => onChangeFilter(status)}
						/>
					);
				})}
			</div>
			{props.loading ? (
				<Skeleton
					height={300}
					variant="rounded"
				/>
			) : (
				<div className={styles["ticket-list"]}>
					<div className={styles["ticket-list-header"]}>
						<p className="w-20cqw mgr-1rem">ID</p>
						<p className="w-20cqw">Detail</p>
					</div>
					{props.tickets ? (
						filterTicket()?.map(t => {
							let userName: string | undefined = "";
							if (props.users) {
								const user = props.users.find(p => p.id === t.id) || null;
								if (user !== null) {
									userName = user.name;
								}
							}
							return (
								<div
									key={t.id}
									tabIndex={0}
									onClick={() => onCardClick(t.id)}
									onKeyDown={e => onEnterDown(e, t.id)}
									className={styles["ticket-list-item"]}
								>
									<p className={styles["ticket-list-item-id"]}>{`TICKET #${t.id}`}</p>
									<div>
										<h3 className={styles["ticket-list-item-des"]}>{t.description}</h3>
										<p>{`Assignee: ${userName}`}</p>
										<div className="display_row">
											<Chip
												size="small"
												color={t.completed ? "success" : "info"}
												label={t.completed ? "Complete" : "Uncomplete"}
											/>
											{t.assigneeId === null && (
												<Chip
													size="small"
													label="Unassigned"
												/>
											)}
										</div>
									</div>
								</div>
							);
						})
					) : (
						<span>No data</span>
					)}
					<div className={styles["ticket-list-footer"]}>
						<div>{`Showing ${pageFirst} to ${pageLast} of ${filterTicket()?.length} tickets`}</div>
						<div>
							<Button
								style={{ marginRight: 8, textTransform: "capitalize" }}
								variant="outlined"
								size="small"
								disabled={state.page === 0}
								onClick={onPrevPage}
							>
								Previous
							</Button>
							<Button
								style={{ textTransform: "capitalize" }}
								variant="outlined"
								size="small"
								disabled={Math.round(filterTicket()?.length / state.skip) === state.page}
								onClick={onNextPage}
							>
								Next
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Tickets;
