import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button/button';

interface TermsAndConditionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  title?: string;
}

export function TermsAndConditions({ 
  open, 
  onOpenChange, 
  onAccept, 
  title = "Terms & Conditions" 
}: TermsAndConditionsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center">
              ⚠️ Important Notice
            </h3>
            <p className="text-red-700">
              This service is for emotional support and validation only. 
              <strong> Inappropriate conversations will result in immediate call termination.</strong>
            </p>
          </div>

          {/* Conversation Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              💬 Conversation Guidelines
            </h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Share your feelings, emotions, and life experiences</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Seek validation and emotional support</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Discuss relationship issues, work stress, or personal challenges</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">❌</span>
                <span><strong>No sexual content, explicit language, or inappropriate topics</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">❌</span>
                <span><strong>No harassment, threats, or abusive behavior</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">❌</span>
                <span><strong>No requests for personal information or contact details</strong></span>
              </li>
            </ul>
          </div>

          {/* Service Terms */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Service Terms</h3>
            <ul className="space-y-2">
              <li>• This is <strong>not a therapy service</strong> - we provide emotional support and validation only</li>
              <li>• All conversations are <strong>anonymous and confidential</strong></li>
              <li>• Listeners are trained volunteers, not licensed therapists</li>
              <li>• Calls may be recorded for quality assurance and safety</li>
              <li>• We reserve the right to terminate calls for inappropriate behavior</li>
              <li>• This service is not a substitute for professional mental health care</li>
            </ul>
          </div>

          {/* Privacy & Safety */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Privacy & Safety</h3>
            <ul className="space-y-2">
              <li>• Your privacy is our priority - we don't collect personal information</li>
              <li>• If you're in crisis, please contact emergency services immediately</li>
              <li>• Listeners will end calls if they feel unsafe or uncomfortable</li>
              <li>• We may report serious concerns to appropriate authorities</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Disclaimer</h3>
            <p className="text-yellow-700">
              This service is for emotional support only. If you're experiencing thoughts of self-harm, 
              please contact a crisis helpline or emergency services immediately. 
              This is not a substitute for professional mental health treatment.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            onClick={onAccept}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          >
            I Accept & Agree
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
