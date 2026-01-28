import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  // Ticket pricing constants
  #TICKET_PRICES = {
    INFANT: 0,
    CHILD: 15,
    ADULT: 25,
  };

  // Maximum tickets allowed per purchase
  #MAX_TICKETS = 25;

  // Third-party services
  #paymentService;
  #seatReservationService;

  constructor(paymentService, seatReservationService) {
    this.#paymentService = paymentService || new TicketPaymentService();
    this.#seatReservationService = seatReservationService || new SeatReservationService();
  }

  /**
   * Purchase tickets for a given account
   * @param {number} accountId - The account ID making the purchase
   * @param {...TicketTypeRequest} ticketTypeRequests - Variable number of ticket type requests
   * @throws {InvalidPurchaseException} - If the purchase request is invalid
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    // Validate account ID
    this.#validateAccountId(accountId);

    // Validate ticket requests exist
    this.#validateTicketRequestsExist(ticketTypeRequests);

    // Count tickets by type
    const ticketCounts = this.#countTicketsByType(ticketTypeRequests);

    // Validate business rules
    this.#validateBusinessRules(ticketCounts);

    // Calculate total amount to pay
    const totalAmount = this.#calculateTotalAmount(ticketCounts);

    // Calculate total seats to reserve (Infants don't get seats)
    const totalSeats = this.#calculateTotalSeats(ticketCounts);

    // Make payment request
    this.#paymentService.makePayment(accountId, totalAmount);

    // Reserve seats
    this.#seatReservationService.reserveSeat(accountId, totalSeats);
  }

  /**
   * Validate that the account ID is valid
   * @private
   */
  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Account ID must be a positive integer');
    }
  }

  /**
   * Validate that at least one ticket request exists
   * @private
   */
  #validateTicketRequestsExist(ticketTypeRequests) {
    if (!ticketTypeRequests || ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException('At least one ticket type request must be provided');
    }
  }

  /**
   * Count tickets by type from the requests
   * @private
   */
  #countTicketsByType(ticketTypeRequests) {
    const counts = {
      INFANT: 0,
      CHILD: 0,
      ADULT: 0,
    };

    for (const request of ticketTypeRequests) {
      if (!(request instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException('Invalid ticket type request');
      }

      const ticketType = request.getTicketType();
      const numberOfTickets = request.getNoOfTickets();

      // Validate positive number of tickets
      if (numberOfTickets <= 0) {
        throw new InvalidPurchaseException('Number of tickets must be greater than zero');
      }

      counts[ticketType] += numberOfTickets;
    }

    return counts;
  }

  /**
   * Validate all business rules
   * @private
   */
  #validateBusinessRules(ticketCounts) {
    const totalTickets = ticketCounts.INFANT + ticketCounts.CHILD + ticketCounts.ADULT;

    // Rule: Maximum 25 tickets can be purchased at a time
    if (totalTickets > this.#MAX_TICKETS) {
      throw new InvalidPurchaseException(
        `Cannot purchase more than ${this.#MAX_TICKETS} tickets at a time`
      );
    }

    // Rule: Child and Infant tickets cannot be purchased without an Adult ticket
    if ((ticketCounts.CHILD > 0 || ticketCounts.INFANT > 0) && ticketCounts.ADULT === 0) {
      throw new InvalidPurchaseException(
        'Child and Infant tickets cannot be purchased without at least one Adult ticket'
      );
    }

    // Additional validation: Infants must sit on Adult laps (one infant per adult max)
    if (ticketCounts.INFANT > ticketCounts.ADULT) {
      throw new InvalidPurchaseException(
        'Number of Infant tickets cannot exceed the number of Adult tickets (Infants sit on Adult laps)'
      );
    }
  }

  /**
   * Calculate the total amount to pay
   * @private
   */
  #calculateTotalAmount(ticketCounts) {
    return (
      ticketCounts.INFANT * this.#TICKET_PRICES.INFANT +
      ticketCounts.CHILD * this.#TICKET_PRICES.CHILD +
      ticketCounts.ADULT * this.#TICKET_PRICES.ADULT
    );
  }

  /**
   * Calculate the total number of seats to reserve
   * Infants don't get seats as they sit on Adult laps
   * @private
   */
  #calculateTotalSeats(ticketCounts) {
    return ticketCounts.CHILD + ticketCounts.ADULT;
  }
}
