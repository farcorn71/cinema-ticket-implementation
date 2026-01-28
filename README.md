# Cinema Tickets JavaScript

A ticket purchasing system for a cinema that handles ticket sales, payment processing, and seat reservations.

## Overview

This application implements a `TicketService` that manages ticket purchases with the following features:
- Supports three ticket types: ADULT, CHILD, and INFANT
- Enforces business rules for ticket purchases
- Integrates with external payment and seat reservation services
- Provides comprehensive validation and error handling

## Ticket Types and Pricing

| Ticket Type | Price | Seat Allocated |
|-------------|-------|----------------|
| ADULT       | £25   | Yes            |
| CHILD       | £15   | Yes            |
| INFANT      | £0    | No (sits on Adult lap) |

## Business Rules

### 1. Ticket Purchase Limits
- Maximum of 25 tickets can be purchased in a single transaction
- At least one ticket must be purchased

### 2. Adult Ticket Requirement
- Child and Infant tickets cannot be purchased without at least one Adult ticket
- This ensures supervision for minors

### 3. Infant Seating
- Infants do not receive a seat allocation
- Infants sit on an Adult's lap
- Number of Infant tickets cannot exceed number of Adult tickets

### 4. Account Validation
- Only accounts with ID greater than zero are valid
- All valid accounts have sufficient funds

## Technical Implementation

### Architecture

```
src/
├── pairtest/
│   ├── TicketService.js          # Main service implementation
│   └── lib/
│       ├── TicketTypeRequest.js  # Immutable ticket request object
│       └── InvalidPurchaseException.js  # Custom exception
└── thirdparty/
    ├── paymentgateway/
    │   └── TicketPaymentService.js      # External payment service
    └── seatbooking/
        └── SeatReservationService.js    # External seat reservation service
```

### Key Design Decisions

1. **Dependency Injection**: Services can be injected for easier testing and flexibility
2. **Private Methods**: All validation and calculation logic is encapsulated in private methods
3. **Single Responsibility**: Each private method handles one specific concern
4. **Immutability**: TicketTypeRequest objects are immutable as required
5. **Clear Error Messages**: Detailed error messages for all validation failures

### Validation Flow

The `purchaseTickets` method follows this validation sequence:

1. **Account ID Validation**
   - Must be a positive integer
   - Must be greater than zero

2. **Request Validation**
   - At least one ticket request must be provided
   - All requests must be TicketTypeRequest instances
   - Each request must have a positive number of tickets

3. **Business Rules Validation**
   - Total tickets must not exceed 25
   - Child/Infant tickets must be accompanied by Adult tickets
   - Infant count cannot exceed Adult count

4. **Processing**
   - Calculate total payment amount
   - Calculate total seats (excluding Infants)
   - Process payment via TicketPaymentService
   - Reserve seats via SeatReservationService

## Installation

### Prerequisites
- Node.js >= 20.9.0
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Usage

### Basic Example

```javascript
import TicketService from './src/pairtest/TicketService.js';
import TicketTypeRequest from './src/pairtest/lib/TicketTypeRequest.js';

const ticketService = new TicketService();

// Purchase 2 adult and 3 child tickets
const adultTickets = new TicketTypeRequest('ADULT', 2);
const childTickets = new TicketTypeRequest('CHILD', 3);

try {
  ticketService.purchaseTickets(123, adultTickets, childTickets);
  console.log('Purchase successful!');
} catch (error) {
  console.error('Purchase failed:', error.message);
}
```

### Advanced Example

```javascript
// Purchase with all ticket types
const adultTickets = new TicketTypeRequest('ADULT', 3);
const childTickets = new TicketTypeRequest('CHILD', 2);
const infantTickets = new TicketTypeRequest('INFANT', 2);

ticketService.purchaseTickets(456, adultTickets, childTickets, infantTickets);

// Expected payment: (3 × £25) + (2 × £15) + (2 × £0) = £105
// Expected seats: 3 + 2 = 5 seats (infants don't get seats)
```

### Custom Service Injection

```javascript
import TicketPaymentService from './src/thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from './src/thirdparty/seatbooking/SeatReservationService.js';

// Use custom service implementations
const paymentService = new TicketPaymentService();
const seatService = new SeatReservationService();

const ticketService = new TicketService(paymentService, seatService);
```

## Testing

The implementation includes comprehensive test coverage:

### Test Categories

1. **Valid Purchase Scenarios**
   - Adult-only purchases
   - Mixed ticket type purchases
   - Maximum ticket limits
   - Multiple requests of same type

2. **Invalid Account ID**
   - Non-integer values
   - Zero and negative values
   - Null values
   - Floating-point numbers

3. **Invalid Ticket Requests**
   - No requests provided
   - Invalid request objects
   - Zero ticket quantities

4. **Business Rule Validation**
   - Maximum 25 tickets enforcement
   - Adult ticket requirement
   - Infant-to-Adult ratio

5. **Payment and Seat Integration**
   - Correct payment calculations
   - Correct seat allocations
   - Service method invocations

6. **Edge Cases**
   - Single ticket purchases
   - Boundary cases (exactly 25 tickets)
   - Multiple requests summation

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Output Example

```
PASS  test/TicketService.test.js
  TicketService
    Valid Purchase Scenarios
      ✓ should successfully purchase adult tickets only
      ✓ should successfully purchase adult and child tickets
      ✓ should successfully purchase adult, child, and infant tickets
      ...
    Invalid Account ID
      ✓ should throw error for non-integer account ID
      ✓ should throw error for zero account ID
      ...
```

## Error Handling

All errors are thrown as `InvalidPurchaseException` with descriptive messages:

| Error Scenario | Error Message |
|----------------|---------------|
| Invalid account ID | "Account ID must be a positive integer" |
| No tickets requested | "At least one ticket type request must be provided" |
| Invalid request object | "Invalid ticket type request" |
| Zero tickets | "Number of tickets must be greater than zero" |
| Too many tickets | "Cannot purchase more than 25 tickets at a time" |
| No adult ticket | "Child and Infant tickets cannot be purchased without at least one Adult ticket" |
| Too many infants | "Number of Infant tickets cannot exceed the number of Adult tickets (Infants sit on Adult laps)" |

## Code Quality

### Coding Standards
- ES6+ module syntax
- Private class fields using `#` prefix
- Descriptive variable and method names
- Comprehensive JSDoc comments
- Consistent code formatting

### Best Practices
- Single Responsibility Principle
- Dependency Injection
- Comprehensive error handling
- Extensive test coverage
- Clear separation of concerns

## Constraints

The following constraints were adhered to:
- ✅ The `TicketService` interface was not modified
- ✅ Code in `thirdparty.*` packages was not modified
- ✅ `TicketTypeRequest` is implemented as an immutable object

## Future Enhancements

Potential improvements for future iterations:
1. Add logging for audit trails
2. Implement transaction rollback on payment failure
3. Add support for discount codes or promotions
4. Implement tiered pricing (e.g., matinee discounts)
5. Add support for different seating categories (VIP, standard, etc.)
6. Implement booking confirmation system
7. Add support for group bookings with special rules

## License

This is a coding exercise project.

## Author

Cornelius Okonkwo
Lead Software Engineer
