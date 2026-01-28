import TicketService from './src/pairtest/TicketService.js';
import TicketTypeRequest from './src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from './src/pairtest/lib/InvalidPurchaseException.js';

// Initialize the ticket service
const ticketService = new TicketService();

console.log('=== Cinema Ticket Service Examples ===\n');

// Example 1: Valid purchase - Adult tickets only
console.log('Example 1: Purchasing 3 adult tickets');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 3);
  ticketService.purchaseTickets(1, adultTickets);
  console.log('✓ Success! Payment: £75, Seats: 3\n');
} catch (error) {
  console.error('✗ Error:', error.message, '\n');
}

// Example 2: Valid purchase - Mixed ticket types
console.log('Example 2: Purchasing 2 adult, 3 child, and 1 infant tickets');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 2);
  const childTickets = new TicketTypeRequest('CHILD', 3);
  const infantTickets = new TicketTypeRequest('INFANT', 1);
  ticketService.purchaseTickets(2, adultTickets, childTickets, infantTickets);
  console.log('✓ Success! Payment: £95, Seats: 5 (infants don\'t get seats)\n');
} catch (error) {
  console.error('✗ Error:', error.message, '\n');
}

// Example 3: Valid purchase - Maximum tickets (25)
console.log('Example 3: Purchasing maximum allowed tickets (25 adults)');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 25);
  ticketService.purchaseTickets(3, adultTickets);
  console.log('✓ Success! Payment: £625, Seats: 25\n');
} catch (error) {
  console.error('✗ Error:', error.message, '\n');
}

// Example 4: Invalid purchase - Too many tickets
console.log('Example 4: Attempting to purchase 26 tickets (exceeds limit)');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 26);
  ticketService.purchaseTickets(4, adultTickets);
  console.log('✓ Success!\n');
} catch (error) {
  console.error('✗ Expected Error:', error.message, '\n');
}

// Example 5: Invalid purchase - Child tickets without adult
console.log('Example 5: Attempting to purchase child tickets without adult ticket');
try {
  const childTickets = new TicketTypeRequest('CHILD', 2);
  ticketService.purchaseTickets(5, childTickets);
  console.log('✓ Success!\n');
} catch (error) {
  console.error('✗ Expected Error:', error.message, '\n');
}

// Example 6: Invalid purchase - More infants than adults
console.log('Example 6: Attempting to purchase 3 infants with only 1 adult');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 1);
  const infantTickets = new TicketTypeRequest('INFANT', 3);
  ticketService.purchaseTickets(6, adultTickets, infantTickets);
  console.log('✓ Success!\n');
} catch (error) {
  console.error('✗ Expected Error:', error.message, '\n');
}

// Example 7: Invalid purchase - Invalid account ID
console.log('Example 7: Attempting purchase with invalid account ID (0)');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 1);
  ticketService.purchaseTickets(0, adultTickets);
  console.log('✓ Success!\n');
} catch (error) {
  console.error('✗ Expected Error:', error.message, '\n');
}

// Example 8: Valid purchase - Multiple requests of same type
console.log('Example 8: Purchasing with multiple adult ticket requests');
try {
  const adultTickets1 = new TicketTypeRequest('ADULT', 2);
  const adultTickets2 = new TicketTypeRequest('ADULT', 3);
  const childTickets = new TicketTypeRequest('CHILD', 1);
  ticketService.purchaseTickets(8, adultTickets1, adultTickets2, childTickets);
  console.log('✓ Success! Payment: £140, Seats: 6\n');
} catch (error) {
  console.error('✗ Error:', error.message, '\n');
}

// Example 9: Valid purchase - Infants equal to adults
console.log('Example 9: Purchasing with infants equal to adults (edge case)');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 5);
  const infantTickets = new TicketTypeRequest('INFANT', 5);
  ticketService.purchaseTickets(9, adultTickets, infantTickets);
  console.log('✓ Success! Payment: £125, Seats: 5 (all infants on laps)\n');
} catch (error) {
  console.error('✗ Error:', error.message, '\n');
}

// Example 10: Valid purchase - Complex mixed scenario
console.log('Example 10: Complex purchase - 10 adults, 8 children, 5 infants');
try {
  const adultTickets = new TicketTypeRequest('ADULT', 10);
  const childTickets = new TicketTypeRequest('CHILD', 8);
  const infantTickets = new TicketTypeRequest('INFANT', 5);
  ticketService.purchaseTickets(10, adultTickets, childTickets, infantTickets);
  console.log('✓ Success! Payment: £370, Seats: 18, Total tickets: 23\n');
} catch (error) {
  console.error('✗ Error:', error.message, '\n');
}

console.log('=== Examples Complete ===');
