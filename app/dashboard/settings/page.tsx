"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Globe, Building, Home, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Country, State, City, LocationFormData } from "@/types/Location"
import Link from "next/link"

const SettingsPage = () => {
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false)
  const [isStateModalOpen, setIsStateModalOpen] = useState(false)
  const [isCityModalOpen, setIsCityModalOpen] = useState(false)

  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const [countryFormData, setCountryFormData] = useState<LocationFormData["country"]>({
    name: "",
    code: "",
  })

  const [stateFormData, setStateFormData] = useState<LocationFormData["state"]>({
    name: "",
    country: "",
  })

  const [cityFormData, setCityFormData] = useState<LocationFormData["city"]>({
    name: "",
    state: "",
    country: "",
  })

  const [filteredStates, setFilteredStates] = useState<State[]>([])

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: string } | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    fetchCountries()
    fetchStates()
    fetchCities()
  }, [])

  const fetchCountries = async () => {
    try {
      const response = await fetch("/api/admin/setting-location?type=countries")
      if (response.ok) {
        const data = await response.json()
        setCountries(data)
      }
    } catch (error) {
      console.error("Error fetching countries:", error)
    }
  }

  const fetchStates = async () => {
    try {
      const response = await fetch("/api/admin/setting-location?type=states")
      if (response.ok) {
        const data = await response.json()
        setStates(data)
      }
    } catch (error) {
      console.error("Error fetching states:", error)
    }
  }

  const fetchCities = async () => {
    try {
      // console.log("[v0] Fetching cities from /api/admin/setting-location?type=cities-towns")
      const response = await fetch("/api/admin/setting-location?type=cities-towns")
      // console.log("[v0] Cities response status:", response.status)
      if (response.ok) {
        const data = await response.json()
        // console.log("[v0] Cities data received:", data)
        setCities(data)
      } else {
        console.log("[v0] Cities fetch failed with status:", response.status)
        const errorText = await response.text()
        console.log("[v0] Error response:", errorText)
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
    }
  }

  const handleCountryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCountryFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setStateFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCityFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCountrySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!countryFormData.name || !countryFormData.code) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/setting-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "country", ...countryFormData }),
      })

      if (response.ok) {
        const newCountry = await response.json()
        setCountries((prev) => [newCountry, ...prev])
        setCountryFormData({ name: "", code: "" })
        setIsCountryModalOpen(false)
        toast({
          title: "Success",
          description: "Country added successfully!",
        })
      } else {
        throw new Error("Failed to add country")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add country. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stateFormData.name || !stateFormData.country) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/setting-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "state", ...stateFormData }),
      })

      if (response.ok) {
        const newState = await response.json()
        setStates((prev) => [newState, ...prev])
        setStateFormData({ name: "", country: "" })
        setIsStateModalOpen(false)
        toast({
          title: "Success",
          description: "State added successfully!",
        })
      } else {
        throw new Error("Failed to add state")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add state. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cityFormData.name || !cityFormData.state || !cityFormData.country) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/setting-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "city-town", ...cityFormData }),
      })

      if (response.ok) {
        const newCity = await response.json()
        setCities((prev) => [newCity, ...prev])
        setCityFormData({ name: "", state: "", country: "" })
        setIsCityModalOpen(false)
        toast({
          title: "Success",
          description: "City added successfully!",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add city")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add city. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStateCountryChange = (value: string) => {
    setStateFormData((prev) => ({
      ...prev,
      country: value,
    }))
  }

  const handleCityCountryChange = (value: string) => {
    setCityFormData((prev) => ({
      ...prev,
      country: value,
      state: "", // Reset state when country changes
    }))
    const filtered = states.filter((state) => state.country === value || state.countryName === value)
    setFilteredStates(filtered)
  }

  const handleCityStateChange = (value: string) => {
    setCityFormData((prev) => ({
      ...prev,
      state: value,
    }))
  }

  const handleDelete = async (id: string, name: string, type: string) => {
    setItemToDelete({ id, name, type })
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/setting-location?type=${itemToDelete.type}&id=${itemToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Update the appropriate state based on type
        if (itemToDelete.type === "country") {
          setCountries((prev) => prev.filter((item) => item._id !== itemToDelete.id))
        } else if (itemToDelete.type === "state") {
          setStates((prev) => prev.filter((item) => item._id !== itemToDelete.id))
        } else if (itemToDelete.type === "city-town") {
          setCities((prev) => prev.filter((item) => item._id !== itemToDelete.id))
        }

        toast({
          title: "Success",
          description: `${itemToDelete.name} deleted successfully!`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your location data across countries, states, and cities</p>
        <Link href="/dashboard/storelocation">
          <Button className="flex items-center mt-3 gap-2">
            <Plus className="h-4 w-4" />
            Add Store Location
          </Button>
        </Link>

      </div>

      <Tabs defaultValue="countries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="countries" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Countries
          </TabsTrigger>
          <TabsTrigger value="states" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            States
          </TabsTrigger>
          <TabsTrigger value="cities" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Cities
          </TabsTrigger>
        </TabsList>

        {/* Countries Tab */}
        <TabsContent value="countries" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Countries ({countries.length})
            </h2>

            <Dialog open={isCountryModalOpen} onOpenChange={setIsCountryModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Country
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Country</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCountrySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="country-name">Country Name</Label>
                    <Input
                      id="country-name"
                      name="name"
                      value={countryFormData.name}
                      onChange={handleCountryInputChange}
                      placeholder="Enter country name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country-code">Country Code</Label>
                    <Input
                      id="country-code"
                      name="code"
                      value={countryFormData.code}
                      onChange={handleCountryInputChange}
                      placeholder="Enter country code (e.g., US, UK)"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCountryModalOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Country"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {countries.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No countries added yet</p>
                  <p className="text-sm text-muted-foreground">Click "Add Country" to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {countries.map((country) => (
                <Card key={country._id || country.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        {country.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(country._id || country.id, country.name, "country")}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Code:</span> {country.code}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Added: {new Date(country.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* States Tab */}
        <TabsContent value="states" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building className="h-5 w-5" />
              States ({states.length})
            </h2>

            <Dialog open={isStateModalOpen} onOpenChange={setIsStateModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add State
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New State</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleStateSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="state-name">State Name</Label>
                    <Input
                      id="state-name"
                      name="name"
                      value={stateFormData.name}
                      onChange={handleStateInputChange}
                      placeholder="Enter state name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state-country">Country</Label>
                    <Select value={stateFormData.country} onValueChange={handleStateCountryChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country._id || country.id} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsStateModalOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add State"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {states.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No states added yet</p>
                  <p className="text-sm text-muted-foreground">Click "Add State" to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {states.map((state) => (
                <Card key={state._id || state.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        {state.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(state._id || state.id, state.name, "state")}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Country:</span> {state.countryName || state.country}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Added: {new Date(state.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cities Tab */}
        <TabsContent value="cities" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Home className="h-5 w-5" />
              Cities ({cities.length})
            </h2>

            <Dialog open={isCityModalOpen} onOpenChange={setIsCityModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add City
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New City</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCitySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="city-name">City Name</Label>
                    <Input
                      id="city-name"
                      name="name"
                      value={cityFormData.name}
                      onChange={handleCityInputChange}
                      placeholder="Enter city name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city-country">Country</Label>
                    <Select value={cityFormData.country} onValueChange={handleCityCountryChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country._id || country.id} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city-state">State</Label>
                    <Select
                      value={cityFormData.state}
                      onValueChange={handleCityStateChange}
                      required
                      disabled={!cityFormData.country}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={cityFormData.country ? "Select a state" : "Select country first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredStates.map((state) => (
                          <SelectItem key={state._id || state.id} value={state.name}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCityModalOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add City"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {cities.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No cities added yet</p>
                  <p className="text-sm text-muted-foreground">Click "Add City" to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cities.map((city) => (
                <Card key={city._id || city.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-primary" />
                        {city.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(city._id || city.id, city.name, "city-town")}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">State:</span> {city.stateName || city.state}
                      </p>
                      <p>
                        <span className="font-medium">Country:</span> {city.countryName || city.country}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Added: {new Date(city.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SettingsPage
