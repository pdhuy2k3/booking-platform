package com.pdh.ai.agent.workflow;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

/**
 * Implements the Evaluator-Optimizer Workflow pattern for iterative quality improvement
 * of travel recommendations and planning in BookingSmart.
 * 
 * <p>This pattern uses a generate-evaluate-refine loop to produce high-quality outputs:</p>
 * <ol>
 * <li><b>Generate:</b> Create initial solution based on user requirements</li>
 * <li><b>Evaluate:</b> Assess quality against specific criteria</li>
 * <li><b>Refine:</b> If not passing, incorporate feedback and regenerate</li>
 * <li><b>Repeat:</b> Continue loop until quality threshold met or max iterations</li>
 * </ol>
 *
 * <p><b>BookingSmart Use Cases:</b></p>
 * <ul>
 * <li><b>Itinerary Planning:</b> Generate → Evaluate timing/logistics → Refine with feedback</li>
 * <li><b>Hotel Recommendations:</b> Generate → Evaluate accuracy/relevance → Refine selection</li>
 * <li><b>Travel Advice:</b> Generate → Evaluate completeness → Refine with missing details</li>
 * <li><b>Custom Packages:</b> Generate → Evaluate budget/preferences → Refine offering</li>
 * </ul>
 *
 * <p><b>Benefits for BookingSmart:</b></p>
 * <ul>
 * <li>Higher quality travel recommendations through iterative refinement</li>
 * <li>Automatic quality assurance for critical planning tasks</li>
 * <li>Detailed feedback chain showing improvement process</li>
 * <li>Catches issues like timing conflicts, budget mismatches, missing information</li>
 * </ul>
 *
 * <p><b>When to Use:</b></p>
 * <ul>
 * <li>Quality-critical outputs (honeymoon itineraries, luxury travel)</li>
 * <li>Complex planning requiring validation (multi-city tours)</li>
 * <li>Personalized recommendations needing accuracy (budget travel)</li>
 * <li>User-facing content requiring completeness (destination guides)</li>
 * </ul>
 *
 * @author BookingSmart Team
 * @see org.springframework.ai.chat.client.ChatClient
 * @see <a href="https://www.anthropic.com/research/building-effective-agents">Building Effective Agents</a>
 */
@Component
public class EvaluatorOptimizerWorkflow {

    private static final Logger logger = LoggerFactory.getLogger(EvaluatorOptimizerWorkflow.class);

    private final ChatClient chatClient;

    // Default prompts for travel planning
    private static final String DEFAULT_GENERATOR_PROMPT = """
            You are a travel planning expert for BookingSmart.
            
            Your task is to create high-quality travel recommendations or plans.
            Consider: timing, logistics, budget, user preferences, local insights.
            
            Provide your response in this JSON format:
            {
                "thoughts": "Your analysis of the task and approach",
                "response": "Your detailed travel recommendation or plan"
            }
            
            Be specific, practical, and ensure all details are accurate.
            
            Context: {context}
            
            Task: {task}
            """;

    private static final String DEFAULT_EVALUATOR_PROMPT = """
            You are a quality assurance expert for BookingSmart travel plans.
            
            Evaluate the travel plan/recommendation for:
            1. **Completeness:** All necessary details included (timing, locations, costs)
            2. **Accuracy:** Realistic timing, valid locations, reasonable prices
            3. **Practicality:** Logical flow, feasible logistics, appropriate pacing
            4. **User Alignment:** Matches stated preferences and budget
            5. **Safety & Legality:** Includes visa/vaccine info, safety considerations
            
            Respond with this JSON format:
            {
                "evaluation": "PASS" or "NEEDS_IMPROVEMENT" or "FAIL",
                "feedback": "Detailed feedback for improvement"
            }
            
            Evaluation Criteria:
            - PASS: Excellent quality, ready to present to user
            - NEEDS_IMPROVEMENT: Good but needs specific refinements
            - FAIL: Major issues requiring significant rework
            
            Original Task: {task}
            
            Content to Evaluate: {content}
            """;

    /**
     * Represents a solution generation step.
     * 
     * @param thoughts The model's reasoning and approach
     * @param response The proposed travel solution
     */
    public record Generation(String thoughts, String response) {}

    /**
     * Represents an evaluation response.
     * 
     * @param evaluation The quality assessment result
     * @param feedback Specific feedback for improvement
     */
    public record EvaluationResponse(Evaluation evaluation, String feedback) {
        public enum Evaluation {
            PASS, NEEDS_IMPROVEMENT, FAIL
        }
    }

    /**
     * Represents the final refined response with improvement history.
     * 
     * @param solution Final optimized solution
     * @param chainOfThought History of all generation attempts and improvements
     * @param iterationCount Number of refinement iterations performed
     */
    public record RefinedResponse(
        String solution, 
        List<Generation> chainOfThought,
        int iterationCount
    ) {}

    public EvaluatorOptimizerWorkflow(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    /**
     * Initiates the evaluator-optimizer workflow for quality-critical travel planning.
     * 
     * <p><b>Example Usage:</b></p>
     * <pre>{@code
     * // Generate high-quality itinerary
     * String task = "Create a 5-day honeymoon itinerary for Hanoi and Ha Long Bay, " +
     *               "budget $3000, focus on romance and culture";
     * 
     * RefinedResponse result = evaluatorOptimizer.optimize(task);
     * 
     * System.out.println("Final Itinerary: " + result.solution());
     * System.out.println("Iterations: " + result.iterationCount());
     * System.out.println("Improvement History: " + result.chainOfThought());
     * }</pre>
     *
     * <p>The workflow automatically:</p>
     * <ol>
     * <li>Generates initial solution</li>
     * <li>Evaluates against quality criteria</li>
     * <li>If PASS: Returns solution</li>
     * <li>If NEEDS_IMPROVEMENT: Incorporates feedback and regenerates</li>
     * <li>Continues until PASS or max iterations (default: 5)</li>
     * </ol>
     *
     * @param task The travel planning task with user requirements
     * @return RefinedResponse containing optimized solution and improvement history
     */
    public RefinedResponse optimize(String task) {
        return optimize(task, 5);
    }

    /**
     * Optimize with custom maximum iterations.
     *
     * @param task The travel planning task
     * @param maxIterations Maximum refinement loops (recommended: 3-5)
     * @return RefinedResponse with optimized solution
     */
    public RefinedResponse optimize(String task, int maxIterations) {
        Assert.hasText(task, "Task cannot be empty");
        Assert.isTrue(maxIterations > 0, "Max iterations must be greater than 0");

        logger.info("🔄 [EVALUATOR-OPTIMIZER] Starting optimization workflow for task");
        logger.info("📋 [EVALUATOR-OPTIMIZER] Max iterations: {}", maxIterations);

        return loop(task, "", new ArrayList<>(), new ArrayList<>(), 0, maxIterations);
    }

    /**
     * Recursive loop implementing the generate-evaluate-refine cycle.
     *
     * @param task Original task
     * @param context Accumulated feedback and previous attempts
     * @param memory List of previous solutions
     * @param chainOfThought History of generation attempts
     * @param iteration Current iteration number
     * @param maxIterations Maximum allowed iterations
     * @return RefinedResponse with final solution or best attempt
     */
    private RefinedResponse loop(
            String task, 
            String context, 
            List<String> memory,
            List<Generation> chainOfThought,
            int iteration,
            int maxIterations) {

        // Check max iterations
        if (iteration >= maxIterations) {
            logger.warn("⚠️ [EVALUATOR-OPTIMIZER] Max iterations ({}) reached, returning best solution", maxIterations);
            String bestSolution = chainOfThought.isEmpty() ? "Unable to generate solution" 
                                                            : chainOfThought.get(chainOfThought.size() - 1).response();
            return new RefinedResponse(bestSolution, chainOfThought, iteration);
        }

        logger.info("🔄 [EVALUATOR-OPTIMIZER] Iteration {}/{}", iteration + 1, maxIterations);

        // Step 1: Generate solution
        Generation generation = generate(task, context);
        memory.add(generation.response());
        chainOfThought.add(generation);

        logger.info("✅ [EVALUATOR-OPTIMIZER] Generated solution (iteration {})", iteration + 1);

        // Step 2: Evaluate solution
        EvaluationResponse evaluationResponse = evaluate(generation.response(), task);

        logger.info("📊 [EVALUATOR-OPTIMIZER] Evaluation: {} (iteration {})", 
                   evaluationResponse.evaluation(), iteration + 1);

        // Step 3: Check if solution passes
        if (evaluationResponse.evaluation().equals(EvaluationResponse.Evaluation.PASS)) {
            logger.info("✅ [EVALUATOR-OPTIMIZER] Solution PASSED quality check on iteration {}", iteration + 1);
            return new RefinedResponse(generation.response(), chainOfThought, iteration + 1);
        }

        // Step 4: If FAIL, try one more time with fresh context
        if (evaluationResponse.evaluation().equals(EvaluationResponse.Evaluation.FAIL)) {
            logger.warn("❌ [EVALUATOR-OPTIMIZER] Solution FAILED, attempting fresh approach");
            String failContext = "Previous attempt failed. Key issues:\n" + evaluationResponse.feedback() +
                               "\n\nStart fresh with these improvements in mind.";
            return loop(task, failContext, new ArrayList<>(), chainOfThought, iteration + 1, maxIterations);
        }

        // Step 5: NEEDS_IMPROVEMENT - accumulate context and refine
        logger.info("🔧 [EVALUATOR-OPTIMIZER] Solution needs improvement, refining with feedback");
        
        StringBuilder newContext = new StringBuilder();
        newContext.append("Previous attempts:\n");
        for (int i = 0; i < memory.size(); i++) {
            newContext.append(String.format("%d. %s\n", i + 1, 
                             memory.get(i).length() > 200 ? memory.get(i).substring(0, 200) + "..." : memory.get(i)));
        }
        newContext.append("\nFeedback for improvement:\n");
        newContext.append(evaluationResponse.feedback());

        return loop(task, newContext.toString(), memory, chainOfThought, iteration + 1, maxIterations);
    }

    /**
     * Generate a solution using the generator prompt.
     *
     * @param task The travel planning task
     * @param context Previous attempts and feedback
     * @return Generation with thoughts and proposed solution
     */
    @SuppressWarnings("null")
    private Generation generate(String task, String context) {
        logger.debug("🤖 [GENERATOR] Generating solution...");

        Generation generation = chatClient.prompt()
                .user(u -> u.text(DEFAULT_GENERATOR_PROMPT)
                           .param("task", task)
                           .param("context", context.isEmpty() ? "First attempt" : context))
                .call()
                .entity(Generation.class);

        logger.debug("💭 [GENERATOR] Thoughts: {}", 
                    generation.thoughts().length() > 100 ? generation.thoughts().substring(0, 100) + "..." 
                                                         : generation.thoughts());

        return generation;
    }

    /**
     * Evaluate the solution quality using the evaluator prompt.
     *
     * @param content The solution to evaluate
     * @param task The original task
     * @return EvaluationResponse with quality assessment and feedback
     */
    @SuppressWarnings("null")
    private EvaluationResponse evaluate(String content, String task) {
        logger.debug("🔍 [EVALUATOR] Evaluating solution quality...");

        EvaluationResponse evaluation = chatClient.prompt()
                .user(u -> u.text(DEFAULT_EVALUATOR_PROMPT)
                           .param("task", task)
                           .param("content", content))
                .call()
                .entity(EvaluationResponse.class);

        logger.debug("📊 [EVALUATOR] Result: {} - {}", 
                    evaluation.evaluation(),
                    evaluation.feedback().length() > 100 ? evaluation.feedback().substring(0, 100) + "..." 
                                                         : evaluation.feedback());

        return evaluation;
    }

    /**
     * Optimize with custom generator and evaluator prompts (advanced usage).
     *
     * @param task The task to optimize
     * @param generatorPrompt Custom generator prompt
     * @param evaluatorPrompt Custom evaluator prompt
     * @param maxIterations Maximum iterations
     * @return RefinedResponse with optimized solution
     */
    public RefinedResponse optimizeWithCustomPrompts(
            String task,
            String generatorPrompt,
            String evaluatorPrompt,
            int maxIterations) {
        
        // This would require modifying the loop to accept custom prompts
        // For now, we use default prompts
        logger.info("🔧 [EVALUATOR-OPTIMIZER] Custom prompts not yet supported, using defaults");
        return optimize(task, maxIterations);
    }
}
