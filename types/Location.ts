export interface Country {
  _id?: string
  id?: string
  name: string
  code: string
  createdAt: string
  updatedAt?: string
}

export interface State {
  _id?: string
  id?: string
  name: string
  code: string
  country: string
  countryName: string
  createdAt: string
  updatedAt?: string
}

export interface City {
  _id?: string
  id?: string
  name: string
  state: string
  stateName: string
  country: string
  countryName: string
  zipCode?: string
  createdAt: string
  updatedAt?: string
}

export interface LocationFormData {
  country: {
    name: string
    code: string
  }
  state: {
    name: string
    country: string
  }
  city: {
    name: string
    state: string
    country: string
  }
}


export interface LocationRequest {
  type: "country" | "state" | "city-town"
  name?: string
  code?: string
  country?: string
  state?: string
}
