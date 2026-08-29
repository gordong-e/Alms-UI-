import React, { useEffect, useRef } from 'react';
import Persona from 'persona';
import { UserProfile } from '../types';
import { api } from '../lib/api';

interface PersonaVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  profile: UserProfile | null;
}

export const PersonaVerification: React.FC<PersonaVerificationProps> = ({
  isOpen,
  onClose,
  onComplete,
  profile,
}) => {
  const clientRef = useRef<any>(null);

  useEffect(() => {
    if (!profile) return;

    // Initialize Persona client
    clientRef.current = new Persona.Client({
      templateId: 'itmpl_AsJ1aGfFZbi1D1yYdhxtAH9jQ3uzoR',
      environmentId: 'env_AsJ1aGfMNSAFjgAEsyVPx5D8fQM9Mw',
      environment: 'sandbox',
      referenceId: profile.id, // Link inquiry to this user
      fields: {
        nameFirst: profile.name.split(' ')[0] || '',
        nameLast: profile.name.split(' ').slice(1).join(' ') || '',
        emailAddress: profile.email || '',
      },
      onReady: () => {
        // If it was already supposed to be open, open it when ready
        if (isOpen) {
          clientRef.current.open();
        }
      },
      onComplete: async ({ inquiryId, status, fields }: any) => {
        console.log(`Completed inquiry ${inquiryId} with status ${status}`);
        try {
          // Mark user as verified in the DB
          await api.markPersonaVerified(profile.id);
          // Trigger the completion callback
          onComplete();
        } catch (err) {
          console.error("Error marking Persona as verified", err);
        }
      },
      onCancel: ({ inquiryId, sessionToken }: any) => {
        console.log("Persona flow canceled", inquiryId);
        onClose();
      },
      onError: (error: any) => {
        console.error("Persona flow error", error);
        onClose();
      },
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
  }, [profile]);

  // Open the flow if the component is told to open and the client is ready
  useEffect(() => {
    if (isOpen && clientRef.current) {
      clientRef.current.open();
    }
  }, [isOpen]);

  // The Persona SDK manages its own modal/overlay automatically when .open() is called.
  // We just return an empty fragment here.
  return <></>;
};
