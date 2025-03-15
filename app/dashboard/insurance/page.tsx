"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Shield } from "lucide-react"
import { insuranceData, userInsurance } from "@/lib/data"
import AssetBuyModal from "@/components/asset-buy-modal"

export default function InsurancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [showBuyModal, setShowBuyModal] = useState(false)

  const filteredMarketInsurance = insuranceData.filter(
    (insurance) =>
      insurance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredUserInsurance = userInsurance.filter(
    (insurance) =>
      insurance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleBuy = (asset: any) => {
    setSelectedAsset(asset)
    setShowBuyModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Insurance</h2>
          <p className="text-muted-foreground">Manage your insurance policies</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search insurance..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>
        <TabsContent value="market" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Market</CardTitle>
              <CardDescription>Browse and buy insurance policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 p-4 text-sm font-medium text-gray-500">
                  <div className="col-span-2">Name</div>
                  <div className="col-span-1">Type</div>
                  <div className="col-span-1">Premium</div>
                  <div className="col-span-1">Coverage</div>
                  <div className="col-span-1">Term</div>
                  <div className="col-span-1 text-right">Action</div>
                </div>
                <div className="divide-y">
                  {filteredMarketInsurance.map((insurance) => (
                    <div key={insurance.id} className="grid grid-cols-7 p-4 text-sm">
                      <div className="col-span-2">
                        <div className="font-medium">{insurance.name}</div>
                        <div className="text-xs text-gray-500">{insurance.provider}</div>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <div className="flex items-center text-indigo-600">
                          <Shield className="mr-1 h-4 w-4" />
                          {insurance.type}
                        </div>
                      </div>
                      <div className="col-span-1 flex items-center font-medium">
                        ₹{insurance.premium.toLocaleString("en-IN")}
                      </div>
                      <div className="col-span-1 flex items-center text-gray-500">{insurance.coverage}</div>
                      <div className="col-span-1 flex items-center text-gray-500">{insurance.term}</div>
                      <div className="col-span-1 flex items-center justify-end">
                        <Button size="sm" onClick={() => handleBuy(insurance)}>
                          Buy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="portfolio" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Insurance Policies</CardTitle>
              <CardDescription>Manage your insurance policies</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUserInsurance.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-7 p-4 text-sm font-medium text-gray-500">
                    <div className="col-span-2">Name</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-1">Premium</div>
                    <div className="col-span-1">Coverage</div>
                    <div className="col-span-1">Next Premium</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>
                  <div className="divide-y">
                    {filteredUserInsurance.map((insurance) => (
                      <div key={insurance.id} className="grid grid-cols-7 p-4 text-sm">
                        <div className="col-span-2">
                          <div className="font-medium">{insurance.name}</div>
                          <div className="text-xs text-gray-500">{insurance.provider}</div>
                        </div>
                        <div className="col-span-1 flex items-center">
                          <div className="flex items-center text-indigo-600">
                            <Shield className="mr-1 h-4 w-4" />
                            {insurance.type}
                          </div>
                        </div>
                        <div className="col-span-1 flex items-center font-medium">
                          ₹{insurance.premium.toLocaleString("en-IN")}
                        </div>
                        <div className="col-span-1 flex items-center text-gray-500">{insurance.coverage}</div>
                        <div className="col-span-1 flex items-center text-gray-500">{insurance.nextPremiumDate}</div>
                        <div className="col-span-1 flex items-center justify-end">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground mb-4">You don't have any insurance policies yet.</p>
                  <Button onClick={() => document.querySelector('[data-state="inactive"][value="market"]')?.click()}>
                    Browse Market
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showBuyModal && selectedAsset && (
        <AssetBuyModal
          asset={selectedAsset}
          assetType="insurance"
          open={showBuyModal}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </div>
  )
}

