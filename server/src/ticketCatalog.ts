import { config } from './config.js';

export type TicketTypeConfig = {
  code: 'early_bird' | 'regular';
  label: string;
  pricePaise: number;
  startsAt: Date;
  endsAt: Date | null;
  capacity: number;
  enabled: boolean;
};

// Times are India Standard Time (UTC+05:30), based on the current event-page copy.
// Confirm these dates and prices with the event organizer before switching to live payments.
export const ticketCatalog: TicketTypeConfig[] = [
  {
    code: 'early_bird',
    label: 'Early Bird Ticket',
    pricePaise: 24900,
    startsAt: new Date('2026-09-26T16:58:00+05:30'),
    endsAt: new Date('2026-10-22T17:54:00+05:30'),
    capacity: config.TICKET_CAPACITY_EARLY_BIRD,
    enabled: true,
  },
  {
    code: 'regular',
    label: 'Regular Ticket',
    pricePaise: 34900,
    startsAt: new Date('2026-10-22T17:54:00+05:30'),
    endsAt: null,
    capacity: config.TICKET_CAPACITY_REGULAR,
    enabled: true,
  },
];

export function isTicketOnSale(ticket: Pick<TicketTypeConfig, 'enabled' | 'startsAt' | 'endsAt' | 'capacity'>, now = new Date()) {
  return ticket.enabled && ticket.capacity > 0 && now >= ticket.startsAt && (!ticket.endsAt || now < ticket.endsAt);
}
