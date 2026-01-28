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

## License

This is a coding exercise project.

## Author

Cornelius
