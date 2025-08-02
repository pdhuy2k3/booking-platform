import { cn } from "@/lib/utils";
import { BookingFlowState } from "@/types/api/booking";
import { Check, CreditCard, FileText, ShoppingCart } from "lucide-react";

interface BookingStepsProps {
  currentStep: BookingFlowState["step"];
  className?: string;
}

const steps = [
  {
    id: "selection",
    name: "Selection",
    description: "Choose your option",
    icon: ShoppingCart,
  },
  {
    id: "details",
    name: "Details",
    description: "Passenger & contact info",
    icon: FileText,
  },
  {
    id: "payment",
    name: "Payment",
    description: "Secure payment",
    icon: CreditCard,
  },
  {
    id: "confirmation",
    name: "Confirmation",
    description: "Booking complete",
    icon: Check,
  },
];

export function BookingSteps({ currentStep, className }: BookingStepsProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={cn("w-full", className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIndex) => {
            const isCompleted = stepIndex < currentStepIndex;
            const isCurrent = step.id === currentStep;
            const isUpcoming = stepIndex > currentStepIndex;

            return (
              <li key={step.id} className="flex-1">
                <div className="flex items-center">
                  {/* Step Circle */}
                  <div className="flex items-center justify-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                        {
                          "border-primary bg-primary text-primary-foreground": isCurrent,
                          "border-primary bg-primary text-primary-foreground": isCompleted,
                          "border-gray-300 bg-white text-gray-500": isUpcoming,
                        }
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="ml-4 min-w-0 flex-1">
                    <div
                      className={cn(
                        "text-sm font-medium transition-colors",
                        {
                          "text-primary": isCurrent || isCompleted,
                          "text-gray-500": isUpcoming,
                        }
                      )}
                    >
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {stepIndex < steps.length - 1 && (
                    <div className="flex-1 ml-4">
                      <div
                        className={cn(
                          "h-0.5 w-full transition-colors",
                          {
                            "bg-primary": stepIndex < currentStepIndex,
                            "bg-gray-300": stepIndex >= currentStepIndex,
                          }
                        )}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
