"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import {
  Wallet,
  Plus,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Plane,
  Train,
  Bus,
  Car,
  Ship,
  CarTaxiFrontIcon as Taxi,
} from "lucide-react"

export default function WalletPage() {
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [amount, setAmount] = useState("")

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "flight":
        return Plane
      case "train":
        return Train
      case "bus":
        return Bus
      case "taxi":
        return Taxi
      case "ferry":
        return Ship
      case "car":
        return Car
      default:
        return Plane
    }
  }

  const transactions = [
    {
      id: "1",
      type: "credit",
      description: "Added funds via UPI",
      amount: 10000,
      date: "2024-03-10",
      status: "completed",
      transportType: null,
    },
    {
      id: "2",
      type: "debit",
      description: "Flight booking - Air India",
      amount: 8500,
      date: "2024-03-08",
      status: "completed",
      transportType: "flight",
    },
    {
      id: "3",
      type: "credit",
      description: "Refund - Cancelled train booking",
      amount: 3500,
      date: "2024-03-05",
      status: "completed",
      transportType: "train",
    },
    {
      id: "4",
      type: "debit",
      description: "Bus booking - RedBus",
      amount: 1800,
      date: "2024-03-02",
      status: "completed",
      transportType: "bus",
    },
  ]

  const currentBalance = 15000

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Wallet</h1>
          <p className="text-gray-600">Manage your funds and view transaction history</p>
        </motion.div>

        {/* Wallet Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8 gradient-bg text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Wallet className="w-8 h-8 mr-3" />
                <h2 className="text-2xl font-bold">Wallet Balance</h2>
              </div>
              <CreditCard className="w-8 h-8 opacity-50" />
            </div>

            <div className="mb-6">
              <div className="text-4xl font-bold mb-2">₹{currentBalance.toLocaleString()}</div>
              <div className="text-white/80">Available Balance</div>
            </div>

            <motion.button
              onClick={() => setShowAddFunds(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-sky-600 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Funds
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Quick Add</h3>
            <p className="text-gray-600 text-sm mb-4">Add ₹5,000 instantly</p>
            <motion.button whileHover={{ scale: 1.05 }} className="btn-secondary w-full">
              Add ₹5,000
            </motion.button>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Auto Reload</h3>
            <p className="text-gray-600 text-sm mb-4">Set up automatic reloads</p>
            <motion.button whileHover={{ scale: 1.05 }} className="btn-secondary w-full">
              Setup
            </motion.button>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Monthly Pass</h3>
            <p className="text-gray-600 text-sm mb-4">Subscribe for discounts</p>
            <motion.button whileHover={{ scale: 1.05 }} className="btn-secondary w-full">
              Learn More
            </motion.button>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Transaction History</h2>

          <div className="space-y-4">
            {transactions.map((transaction, index) => {
              const TransportIcon = transaction.transportType ? getTransportIcon(transaction.transportType) : null
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        transaction.type === "credit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {TransportIcon ? (
                        <TransportIcon className="w-5 h-5" />
                      ) : transaction.type === "credit" ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{transaction.description}</div>
                      <div className="text-sm text-gray-600">{transaction.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{transaction.status}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Add Funds Modal */}
        {showAddFunds && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Add Funds</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                    <option>UPI</option>
                    <option>Credit Card</option>
                    <option>Debit Card</option>
                    <option>Net Banking</option>
                  </select>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1000, 5000, 10000].map((quickAmount) => (
                      <motion.button
                        key={quickAmount}
                        onClick={() => setAmount(quickAmount.toString())}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="py-2 px-4 border border-gray-300 rounded-lg hover:border-sky-500 hover:text-sky-500 transition-colors"
                      >
                        ₹{quickAmount.toLocaleString()}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  onClick={() => setShowAddFunds(false)}
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowAddFunds(false)
                    setAmount("")
                  }}
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 btn-primary"
                >
                  Add Funds
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
