import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import config from './lib/config.js';

export default class TicketService {

  #TICKET_PRICES;

  #MAX_TICKETS;

  #ENFORCE_INFANT_ADULT_RATIO;

  #paymentService;
  #seatReservationService;

  constructor(paymentService, seatReservationService) {
    this.#paymentService = paymentService || new TicketPaymentService();
    this.#seatReservationService = seatReservationService || new SeatReservationService();
    
    this.#TICKET_PRICES = config.ticketPrices;
    this.#MAX_TICKETS = config.maxTickets;
    this.#ENFORCE_INFANT_ADULT_RATIO = config.enforceInfantAdultRatio;
  }

  /**
   * Purchase tickets for a given account
   * @param {number} accountId - The account ID making the purchase
   * @param {...TicketTypeRequest} ticketTypeRequests - Variable number of ticket type requests
   * @throws {InvalidPurchaseException} - If the purchase request is invalid
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
 
    this.#validateAccountId(accountId);

    this.#validateTicketRequestsExist(ticketTypeRequests);

    const ticketCounts = this.#countTicketsByType(ticketTypeRequests);

    this.#validateBusinessRules(ticketCounts);

    const totalAmount = this.#calculateTotalAmount(ticketCounts);

    const totalSeats = this.#calculateTotalSeats(ticketCounts);

    this.#paymentService.makePayment(accountId, totalAmount);

    
    this.#seatReservationService.reserveSeat(accountId, totalSeats);
  }

  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Account ID must be a positive integer');
    }
  }

  #validateTicketRequestsExist(ticketTypeRequests) {
    if (!ticketTypeRequests || ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException('At least one ticket type request must be provided');
    }
  }

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

      if (numberOfTickets <= 0) {
        throw new InvalidPurchaseException('Number of tickets must be greater than zero');
      }

      counts[ticketType] += numberOfTickets;
    }

    return counts;
  }

  #validateBusinessRules(ticketCounts) {
    const totalTickets = ticketCounts.INFANT + ticketCounts.CHILD + ticketCounts.ADULT;

    if (totalTickets > this.#MAX_TICKETS) {
      throw new InvalidPurchaseException(
        `Cannot purchase more than ${this.#MAX_TICKETS} tickets at a time`
      );
    }

    if ((ticketCounts.CHILD > 0 || ticketCounts.INFANT > 0) && ticketCounts.ADULT === 0) {
      throw new InvalidPurchaseException(
        'Child and Infant tickets cannot be purchased without at least one Adult ticket'
      );
    }

    if (this.#ENFORCE_INFANT_ADULT_RATIO && ticketCounts.INFANT > ticketCounts.ADULT) {
      throw new InvalidPurchaseException(
        'Number of Infant tickets cannot exceed the number of Adult tickets (Infants sit on Adult laps)'
      );
    }
  }

  #calculateTotalAmount(ticketCounts) {
    return (
      ticketCounts.INFANT * this.#TICKET_PRICES.INFANT +
      ticketCounts.CHILD * this.#TICKET_PRICES.CHILD +
      ticketCounts.ADULT * this.#TICKET_PRICES.ADULT
    );
  }

  #calculateTotalSeats(ticketCounts) {
    return ticketCounts.CHILD + ticketCounts.ADULT;
  }
}