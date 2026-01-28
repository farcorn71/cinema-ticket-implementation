import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });


class Config {
  constructor() {
    this.maxTickets = this.#getEnvAsInt('MAX_TICKETS', 25);
    this.ticketPrices = {
      INFANT: this.#getEnvAsInt('TICKET_PRICE_INFANT', 0),
      CHILD: this.#getEnvAsInt('TICKET_PRICE_CHILD', 15),
      ADULT: this.#getEnvAsInt('TICKET_PRICE_ADULT', 25),
    };
    this.enforceInfantAdultRatio = this.#getEnvAsBool('ENFORCE_INFANT_ADULT_RATIO', true);
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.#validate();
  }

  #getEnvAsInt(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} must be a valid integer, got: ${value}`);
    }
    return parsed;
  }

  
  #getEnvAsBool(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    return value.toLowerCase() === 'true' || value === '1';
  }

  #validate() {
    if (this.maxTickets <= 0) {
      throw new Error('MAX_TICKETS must be a positive integer');
    }

    if (this.ticketPrices.INFANT < 0 || this.ticketPrices.CHILD < 0 || this.ticketPrices.ADULT < 0) {
      throw new Error('Ticket prices must be non-negative');
    }

    if (this.ticketPrices.ADULT <= 0) {
      throw new Error('Adult ticket price must be greater than zero');
    }
  }

  toObject() {
    return {
      maxTickets: this.maxTickets,
      ticketPrices: this.ticketPrices,
      enforceInfantAdultRatio: this.enforceInfantAdultRatio,
      nodeEnv: this.nodeEnv,
    };
  }
}

export default new Config();