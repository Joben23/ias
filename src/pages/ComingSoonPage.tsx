import { motion } from 'framer-motion';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHRModule } from '@/contexts/HRModuleContext';

interface ComingSoonPageProps {
  moduleName: string;
  description?: string;
}

export default function ComingSoonPage({ moduleName, description }: ComingSoonPageProps) {
  const { setSelectedModule } = useHRModule();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 max-w-2xl mx-auto px-4"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-12 h-12 text-primary" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-bold text-foreground">
            {moduleName}
          </h1>
          {description && (
            <p className="text-xl text-muted-foreground">
              {description}
            </p>
          )}
        </motion.div>

        {/* Coming Soon Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">
                Coming Soon
              </CardTitle>
              <CardDescription className="text-base">
                This module is currently under development and will be available in a future update.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                We're working hard to bring you the best HR experience. Stay tuned for updates!
              </p>

              {/* Back to HR1 Button */}
              <div className="pt-4">
                <Button
                  onClick={() => setSelectedModule('hr1')}
                  className="group"
                  size="lg"
                >
                  Return to HR1
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">
            Want to know more about our roadmap? Check back soon for exciting new features.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}