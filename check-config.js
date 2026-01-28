import config from './src/pairtest/lib/config.js';

console.log('\n🎬 Cinema Tickets Configuration\n');
console.log('Current Settings:');
console.log('─'.repeat(50));

const cfg = config.toObject();

console.log(`MAX_TICKETS:                ${cfg.maxTickets}`);
console.log(`TICKET_PRICE_ADULT:         £${cfg.ticketPrices.ADULT}`);
console.log(`TICKET_PRICE_CHILD:         £${cfg.ticketPrices.CHILD}`);
console.log(`TICKET_PRICE_INFANT:        £${cfg.ticketPrices.INFANT}`);
console.log(`ENFORCE_INFANT_ADULT_RATIO: ${cfg.enforceInfantAdultRatio}`);

console.log('─'.repeat(50));
console.log('\n✅ Config loaded successfully!\n');