import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, ExternalLink, Key, CheckCircle2 } from "lucide-react";

export function ApiGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-primary gap-2 p-0 h-auto font-normal hover:no-underline">
          <HelpCircle className="w-4 h-4" />
          How do I get a free API key?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Get Your Free OpenRouter Key</DialogTitle>
          <DialogDescription>
            Follow these simple steps to start generating questions for free.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <span className="font-bold text-primary">1</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Visit OpenRouter</h3>
                <p className="text-muted-foreground">Go to the OpenRouter website. It's a platform that lets you access many AI models, including free ones.</p>
                <Button variant="outline" className="gap-2" onClick={() => window.open('https://openrouter.ai', '_blank')}>
                  Go to OpenRouter.ai
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <span className="font-bold text-primary">2</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Sign Up / Log In</h3>
                <p className="text-muted-foreground">Create an account using Google or GitHub. It takes less than a minute.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <span className="font-bold text-primary">3</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Create a Key</h3>
                <p className="text-muted-foreground">
                  Search for the exact model <code>tngtech/deepseek-r1t2-chimera:free</code>.
                  <br />
                  Click on <strong>Get Started</strong> and then <strong>Generate Key</strong>.
                  <br />
                  Name it "OPTIMUM" (or anything you like).
                </p>
                <div className="p-4 bg-secondary/50 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                    <Key className="w-4 h-4" />
                    sk-or-v1-................................
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <span className="font-bold text-primary">4</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Paste & Play</h3>
                <p className="text-muted-foreground">
                  Copy the key (it starts with <code>sk-or-</code>) and paste it into the OPTIMUM app.
                </p>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">You're ready to generate free questions!</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> We use the <code>tngtech/deepseek-r1t2-chimera:free</code> model which is completely free to use on OpenRouter. You don't need to add a credit card.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
