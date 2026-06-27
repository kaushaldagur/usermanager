export type Address = {
  street?: string;
  suite?: string;
  city?: string;
  zipcode?: string;
};

export type Company = {
  name?: string;
  catchPhrase?: string;
  bs?: string;
};

export type User = {
  id: number;
  name: string;
  username?: string;
  email: string;
  phone: string;
  address?: Address;
  company?: Company;
};

export type UserInput = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  profession?: string;
};
