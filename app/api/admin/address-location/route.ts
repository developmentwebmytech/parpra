import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Country, State, CityTown } from "@/lib/models/Location"
import type { LocationRequest } from "@/types/Location"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    switch (type) {
      case "countries":
        const countries = await Country.find({}).sort({ createdAt: -1 })
        return NextResponse.json(countries)

      case "states":
        const states = await State.find({}).populate("country", "name code").sort({ createdAt: -1 })
        return NextResponse.json(states)

      case "cities-towns":
        const citiesTowns = await CityTown.find({})
          .populate("country", "name code")
          .populate("state", "name code")
          .sort({ createdAt: -1 })
        return NextResponse.json(citiesTowns)

      default:
        return NextResponse.json(
          { error: "Invalid type parameter. Use 'countries', 'states', or 'cities-towns'" },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body: LocationRequest = await request.json()
    const { type, name, code, country, state } = body

    switch (type) {
      case "country":
        if (!name || !code) {
          return NextResponse.json({ error: "Name and code are required for countries" }, { status: 400 })
        }

        const existingCountry = await Country.findOne({
          $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }],
        })

        if (existingCountry) {
          return NextResponse.json({ error: "Country with this name or code already exists" }, { status: 400 })
        }

        const newCountry = new Country({
          name: name.trim(),
          code: code.trim().toUpperCase(),
        })

        await newCountry.save()
        return NextResponse.json(newCountry, { status: 201 })

      case "state":
        if (!name || !country) {
          return NextResponse.json({ error: "Name and country are required for states" }, { status: 400 })
        }

        const countryDoc = await Country.findOne({ name: country.trim() })
        if (!countryDoc) {
          return NextResponse.json({ error: "Country not found" }, { status: 400 })
        }

        const existingState = await State.findOne({
          name: name.trim(),
          country: countryDoc._id,
        })

        if (existingState) {
          return NextResponse.json({ error: "State already exists in this country" }, { status: 400 })
        }

        const newState = new State({
          name: name.trim(),
          code: name.trim().substring(0, 3).toUpperCase(),
          country: countryDoc._id,
          countryName: countryDoc.name,
        })

        await newState.save()
        await newState.populate("country", "name code")
        return NextResponse.json(newState, { status: 201 })

      case "city-town":
        if (!name || !state || !country) {
          return NextResponse.json({ error: "Name, state, and country are required for city/town" }, { status: 400 })
        }

        const cityCountryDoc = await Country.findOne({ name: country.trim() })
        if (!cityCountryDoc) {
          return NextResponse.json({ error: "Country not found" }, { status: 400 })
        }

        const stateDoc = await State.findOne({
          name: state.trim(),
          country: cityCountryDoc._id,
        })
        if (!stateDoc) {
          return NextResponse.json({ error: "State not found in the selected country" }, { status: 400 })
        }

        const existingCityTown = await CityTown.findOne({
          name: name.trim(),
          state: stateDoc._id,
        })

        if (existingCityTown) {
          return NextResponse.json({ error: "City/Town already exists in this state" }, { status: 400 })
        }

        const newCityTown = new CityTown({
          name: name.trim(),
          state: stateDoc._id,
          stateName: stateDoc.name,
          country: cityCountryDoc._id,
          countryName: cityCountryDoc.name,
        })

        await newCityTown.save()
        await newCityTown.populate(["country", "state"])
        return NextResponse.json(newCityTown, { status: 201 })

      default:
        return NextResponse.json({ error: "Invalid type. Use 'country', 'state', or 'city-town'" }, { status: 400 })
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    switch (type) {
      case "country":
        // Check if country has associated states
        const associatedStates = await State.find({ country: id })
        if (associatedStates.length > 0) {
          return NextResponse.json(
            { error: "Cannot delete country with associated states. Delete states first." },
            { status: 400 },
          )
        }

        const deletedCountry = await Country.findByIdAndDelete(id)
        if (!deletedCountry) {
          return NextResponse.json({ error: "Country not found" }, { status: 404 })
        }
        return NextResponse.json({ message: "Country deleted successfully" })

      case "state":
        // Check if state has associated cities
        const associatedCities = await CityTown.find({ state: id })
        if (associatedCities.length > 0) {
          return NextResponse.json(
            { error: "Cannot delete state with associated cities. Delete cities first." },
            { status: 400 },
          )
        }

        const deletedState = await State.findByIdAndDelete(id)
        if (!deletedState) {
          return NextResponse.json({ error: "State not found" }, { status: 404 })
        }
        return NextResponse.json({ message: "State deleted successfully" })

      case "city-town":
        const deletedCity = await CityTown.findByIdAndDelete(id)
        if (!deletedCity) {
          return NextResponse.json({ error: "City not found" }, { status: 404 })
        }
        return NextResponse.json({ message: "City deleted successfully" })

      default:
        return NextResponse.json(
          { error: "Invalid type parameter. Use 'country', 'state', or 'city-town'" },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
  }
}
