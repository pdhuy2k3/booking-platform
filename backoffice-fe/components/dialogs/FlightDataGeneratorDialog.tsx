"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlightScheduleService } from "@/services/flight-schedule-service";
import { toast } from "sonner";
import { Calendar, Clock, Trash2, Zap } from "lucide-react";

interface FlightDataGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function FlightDataGeneratorDialog({
  isOpen,
  onClose,
  onSuccess,
}: FlightDataGeneratorDialogProps) {
  const [loading, setLoading] = useState(false);
  
  // Single date generation
  const [singleDate, setSingleDate] = useState("");
  
  // Range generation
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Next days generation
  const [numberOfDays, setNumberOfDays] = useState(7);
  
  // Cleanup
  const [daysToKeep, setDaysToKeep] = useState(30);

  const handleGenerateSingleDate = async () => {
    try {
      setLoading(true);
      const result = await FlightScheduleService.generateDailyFlightData(singleDate || undefined);
      toast.success(`Generated ${result.schedules_created} schedules for ${result.target_date}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate flight data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRange = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    try {
      setLoading(true);
      const result = await FlightScheduleService.generateFlightDataRange(startDate, endDate);
      const totalSchedules = Object.values(result.data).reduce((sum: number, count: any) => sum + count, 0);
      toast.success(`Generated ${totalSchedules} schedules from ${startDate} to ${endDate}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate flight data range");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNextDays = async () => {
    try {
      setLoading(true);
      const result = await FlightScheduleService.generateDataForNextDays(numberOfDays);
      toast.success(`Generated flight data for next ${numberOfDays} days (${result.data.total_schedules} schedules)`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate flight data");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm(`Are you sure you want to delete flight data older than ${daysToKeep} days?`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await FlightScheduleService.cleanupOldFlightData(daysToKeep);
      toast.success(`Cleaned up ${result.deleted_schedules} old schedules`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to cleanup flight data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSingleDate("");
    setStartDate("");
    setEndDate("");
    setNumberOfDays(7);
    setDaysToKeep(30);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Flight Data Generator
          </DialogTitle>
          <DialogDescription>
            Generate flight schedules and fares for demo purposes
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="single">Single Date</TabsTrigger>
            <TabsTrigger value="range">Date Range</TabsTrigger>
            <TabsTrigger value="next">Next Days</TabsTrigger>
            <TabsTrigger value="cleanup">Cleanup</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Generate for Single Date
                </CardTitle>
                <CardDescription>
                  Generate flight schedules and fares for a specific date
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="singleDate">Target Date (optional)</Label>
                  <Input
                    id="singleDate"
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    placeholder="Leave empty for tomorrow"
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to generate for tomorrow
                  </p>
                </div>
                <Button 
                  onClick={handleGenerateSingleDate} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Generating..." : "Generate Flight Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="range" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Generate for Date Range
                </CardTitle>
                <CardDescription>
                  Generate flight schedules and fares for multiple dates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateRange} 
                  disabled={loading || !startDate || !endDate}
                  className="w-full"
                >
                  {loading ? "Generating..." : "Generate Date Range"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="next" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Generate for Next Days
                </CardTitle>
                <CardDescription>
                  Generate flight data for the next N days starting from tomorrow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfDays">Number of Days</Label>
                  <Input
                    id="numberOfDays"
                    type="number"
                    min="1"
                    max="30"
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 7)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Will generate data for the next {numberOfDays} days starting from tomorrow
                  </p>
                </div>
                <Button 
                  onClick={handleGenerateNextDays} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Generating..." : `Generate Next ${numberOfDays} Days`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cleanup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Cleanup Old Data
                </CardTitle>
                <CardDescription>
                  Remove old flight schedules and fares to keep the database clean
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daysToKeep">Days to Keep</Label>
                  <Input
                    id="daysToKeep"
                    type="number"
                    min="1"
                    max="365"
                    value={daysToKeep}
                    onChange={(e) => setDaysToKeep(parseInt(e.target.value) || 30)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Will delete flight data older than {daysToKeep} days
                  </p>
                </div>
                <Button 
                  onClick={handleCleanup} 
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  {loading ? "Cleaning..." : `Cleanup Data Older Than ${daysToKeep} Days`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}