import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';
import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../src/thirdparty/seatbooking/SeatReservationService.js';

describe('TicketService', () => {
  let ticketService;
  let mockPaymentService;
  let mockSeatReservationService;

  beforeEach(() => {
    // Create mock services
    mockPaymentService = {
      makePayment: jest.fn(),
    };
    mockSeatReservationService = {
      reserveSeat: jest.fn(),
    };

    ticketService = new TicketService(mockPaymentService, mockSeatReservationService);
  });

  describe('Valid Purchase Scenarios', () => {
    test('should successfully purchase adult tickets only', () => {
      const accountId = 1;
      const adultTickets = new TicketTypeRequest('ADULT', 3);

      ticketService.purchaseTickets(accountId, adultTickets);

      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 75); // 3 * £25
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 3);
    });

    test('should successfully purchase adult and child tickets', () => {
      const accountId = 5;
      const adultTickets = new TicketTypeRequest('ADULT', 2);
      const childTickets = new TicketTypeRequest('CHILD', 3);

      ticketService.purchaseTickets(accountId, adultTickets, childTickets);

      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 95); // (2 * £25) + (3 * £15)
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 5); // 2 adults + 3 children
    });

    test('should successfully purchase adult, child, and infant tickets', () => {
      const accountId = 10;
      const adultTickets = new TicketTypeRequest('ADULT', 2);
      const childTickets = new TicketTypeRequest('CHILD', 2);
      const infantTickets = new TicketTypeRequest('INFANT', 1);

      ticketService.purchaseTickets(accountId, adultTickets, childTickets, infantTickets);

      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 80); // (2 * £25) + (2 * £15) + (1 * £0)
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 4); // 2 adults + 2 children (no seat for infant)
    });

    test('should successfully purchase adult and infant tickets', () => {
      const accountId = 15;
      const adultTickets = new TicketTypeRequest('ADULT', 2);
      const infantTickets = new TicketTypeRequest('INFANT', 2);

      ticketService.purchaseTickets(accountId, adultTickets, infantTickets);

      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 50); // (2 * £25) + (2 * £0)
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 2); // 2 adults only
    });

    test('should handle maximum of 25 tickets', () => {
      const accountId = 20;
      const adultTickets = new TicketTypeRequest('ADULT', 25);

      ticketService.purchaseTickets(accountId, adultTickets);

      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 625); // 25 * £25
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 25);
    });

    test('should handle mixed ticket types totaling 25 tickets', () => {
      const accountId = 25;
      const adultTickets = new TicketTypeRequest('ADULT', 10);
      const childTickets = new TicketTypeRequest('CHILD', 10);
      const infantTickets = new TicketTypeRequest('INFANT', 5);

      ticketService.purchaseTickets(accountId, adultTickets, childTickets, infantTickets);

      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 400); // (10 * £25) + (10 * £15)
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 20); // 10 adults + 10 children
    });

    test('should handle multiple ticket requests of the same type', () => {
      const accountId = 30;
      const adultTickets1 = new TicketTypeRequest('ADULT', 2);
      const adultTickets2 = new TicketTypeRequest('ADULT', 3);
      const childTickets = new TicketTypeRequest('CHILD', 1);

      ticketService.purchaseTickets(accountId, adultTickets1, adultTickets2, childTickets);

      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 140); // (5 * £25) + (1 * £15)
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 6);
    });
  });

  describe('Invalid Account ID', () => {
    test('should throw error for non-integer account ID', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 1);

      expect(() => {
        ticketService.purchaseTickets('abc', adultTickets);
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets('abc', adultTickets);
      }).toThrow('Account ID must be a positive integer');
    });

    test('should throw error for zero account ID', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 1);

      expect(() => {
        ticketService.purchaseTickets(0, adultTickets);
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(0, adultTickets);
      }).toThrow('Account ID must be a positive integer');
    });

    test('should throw error for negative account ID', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 1);

      expect(() => {
        ticketService.purchaseTickets(-5, adultTickets);
      }).toThrow(InvalidPurchaseException);
    });

    test('should throw error for null account ID', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 1);

      expect(() => {
        ticketService.purchaseTickets(null, adultTickets);
      }).toThrow(InvalidPurchaseException);
    });

    test('should throw error for floating-point account ID', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 1);

      expect(() => {
        ticketService.purchaseTickets(1.5, adultTickets);
      }).toThrow(InvalidPurchaseException);
    });
  });

  describe('Invalid Ticket Requests', () => {
    test('should throw error when no ticket requests provided', () => {
      expect(() => {
        ticketService.purchaseTickets(1);
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1);
      }).toThrow('At least one ticket type request must be provided');
    });

    test('should throw error for non-TicketTypeRequest object', () => {
      expect(() => {
        ticketService.purchaseTickets(1, { type: 'ADULT', count: 2 });
      }).toThrow(InvalidPurchaseException);
    });

    test('should throw error for zero tickets in a request', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 0);

      expect(() => {
        ticketService.purchaseTickets(1, adultTickets);
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1, adultTickets);
      }).toThrow('Number of tickets must be greater than zero');
    });
  });

  describe('Business Rule: Maximum 25 Tickets', () => {
    test('should throw error when purchasing more than 25 tickets', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 26);

      expect(() => {
        ticketService.purchaseTickets(1, adultTickets);
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1, adultTickets);
      }).toThrow('Cannot purchase more than 25 tickets at a time');
    });

    test('should throw error when combined tickets exceed 25', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 15);
      const childTickets = new TicketTypeRequest('CHILD', 11);

      expect(() => {
        ticketService.purchaseTickets(1, adultTickets, childTickets);
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1, adultTickets, childTickets);
      }).toThrow('Cannot purchase more than 25 tickets at a time');
    });

    test('should throw error when including infants pushes total over 25', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 10);
      const childTickets = new TicketTypeRequest('CHILD', 10);
      const infantTickets = new TicketTypeRequest('INFANT', 6);

      expect(() => {
        ticketService.purchaseTickets(1, adultTickets, childTickets, infantTickets);
      }).toThrow(InvalidPurchaseException);
    });
  });

  describe('Business Rule: Child and Infant tickets require Adult ticket', () => {
    test('should throw error when purchasing child tickets without adult tickets', () => {
      const childTickets = new TicketTypeRequest('CHILD', 2);

      expect(() => {
        ticketService.purchaseTickets(1, childTickets);
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1, childTickets);
      }).toThrow('Child and Infant tickets cannot be purchased without at least one Adult ticket');
    });

    test('should throw error when purchasing infant tickets without adult tickets', () => {
      const infantTickets = new TicketTypeRequest('INFANT', 1);

      expect(() => {
        ticketService.purchaseTickets(1, infantTickets);
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1, infantTickets);
      }).toThrow('Child and Infant tickets cannot be purchased without at least one Adult ticket');
    });

    test('should throw error when purchasing child and infant tickets without adult tickets', () => {
      const childTickets = new TicketTypeRequest('CHILD', 2);
      const infantTickets = new TicketTypeRequest('INFANT', 1);

      expect(() => {
        ticketService.purchaseTickets(1, childTickets, infantTickets);
      }).toThrow(InvalidPurchaseException);
    });
  });

  describe('Business Rule: Infants sit on Adult laps', () => {
    test('should throw error when infant count exceeds adult count', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 1);
      const infantTickets = new TicketTypeRequest('INFANT', 2);

      expect(() => {
        ticketService.purchaseTickets(1, adultTickets, infantTickets);
      }).toThrow(InvalidPurchaseException);
      expect(() => {
        ticketService.purchaseTickets(1, adultTickets, infantTickets);
      }).toThrow('Number of Infant tickets cannot exceed the number of Adult tickets');
    });

    test('should throw error when infant count greatly exceeds adult count', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 2);
      const infantTickets = new TicketTypeRequest('INFANT', 5);

      expect(() => {
        ticketService.purchaseTickets(1, adultTickets, infantTickets);
      }).toThrow(InvalidPurchaseException);
    });
  });

  describe('Payment and Seat Reservation Integration', () => {
    test('should call payment service with correct amount for multiple ticket types', () => {
      const accountId = 100;
      const adultTickets = new TicketTypeRequest('ADULT', 3);
      const childTickets = new TicketTypeRequest('CHILD', 2);
      const infantTickets = new TicketTypeRequest('INFANT', 1);

      ticketService.purchaseTickets(accountId, adultTickets, childTickets, infantTickets);

      // (3 * £25) + (2 * £15) + (1 * £0) = £105
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 105);
      expect(mockPaymentService.makePayment).toHaveBeenCalledTimes(1);
    });

    test('should call seat reservation service with correct seat count', () => {
      const accountId = 200;
      const adultTickets = new TicketTypeRequest('ADULT', 4);
      const childTickets = new TicketTypeRequest('CHILD', 3);
      const infantTickets = new TicketTypeRequest('INFANT', 2);

      ticketService.purchaseTickets(accountId, adultTickets, childTickets, infantTickets);

      // 4 adults + 3 children = 7 seats (infants don't get seats)
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 7);
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledTimes(1);
    });

    test('should not reserve seats for infants', () => {
      const accountId = 300;
      const adultTickets = new TicketTypeRequest('ADULT', 5);
      const infantTickets = new TicketTypeRequest('INFANT', 5);

      ticketService.purchaseTickets(accountId, adultTickets, infantTickets);

      // Only 5 seats for adults, 0 for infants
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 5);
    });

    test('should handle payment of £0 for infant-only with adults', () => {
      const accountId = 400;
      const adultTickets = new TicketTypeRequest('ADULT', 1);
      const infantTickets = new TicketTypeRequest('INFANT', 1);

      ticketService.purchaseTickets(accountId, adultTickets, infantTickets);

      // (1 * £25) + (1 * £0) = £25
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 25);
    });
  });

  describe('Edge Cases', () => {
    test('should handle single adult ticket', () => {
      const accountId = 500;
      const adultTickets = new TicketTypeRequest('ADULT', 1);

      ticketService.purchaseTickets(accountId, adultTickets);

      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 25);
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 1);
    });

    test('should handle boundary case of exactly 25 tickets with mixed types', () => {
      const accountId = 600;
      const adultTickets = new TicketTypeRequest('ADULT', 13);
      const childTickets = new TicketTypeRequest('CHILD', 7);
      const infantTickets = new TicketTypeRequest('INFANT', 5);

      ticketService.purchaseTickets(accountId, adultTickets, childTickets, infantTickets);

      // (13 * £25) + (7 * £15) + (5 * £0) = £430
      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 430);
      // 13 + 7 = 20 seats
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 20);
    });

    test('should correctly sum tickets from multiple requests of same type', () => {
      const accountId = 700;
      const adultTickets1 = new TicketTypeRequest('ADULT', 1);
      const adultTickets2 = new TicketTypeRequest('ADULT', 1);
      const adultTickets3 = new TicketTypeRequest('ADULT', 1);

      ticketService.purchaseTickets(accountId, adultTickets1, adultTickets2, adultTickets3);

      expect(mockPaymentService.makePayment).toHaveBeenCalledWith(accountId, 75); // 3 * £25
      expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 3);
    });
  });

  describe('Service Instantiation', () => {
    test('should use default services when none provided', () => {
      const service = new TicketService();
      const adultTickets = new TicketTypeRequest('ADULT', 1);

      // Should not throw error
      expect(() => {
        service.purchaseTickets(1, adultTickets);
      }).not.toThrow();
    });

    test('should use provided custom services', () => {
      const customPayment = { makePayment: jest.fn() };
      const customSeat = { reserveSeat: jest.fn() };
      const service = new TicketService(customPayment, customSeat);
      const adultTickets = new TicketTypeRequest('ADULT', 2);

      service.purchaseTickets(1, adultTickets);

      expect(customPayment.makePayment).toHaveBeenCalledWith(1, 50);
      expect(customSeat.reserveSeat).toHaveBeenCalledWith(1, 2);
    });
  });
});
