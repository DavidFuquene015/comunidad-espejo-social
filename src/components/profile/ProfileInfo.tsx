
import React from 'react';
import { Github, Linkedin, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileInfoProps {
  profile: any;
}

const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  return (
    <div className="space-y-6">
      {/* Bio */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-3">Acerca de mí</h3>
        <p className="text-white/80 leading-relaxed">
          {profile?.bio || 'No hay información biográfica disponible.'}
        </p>
      </div>

      {/* Links */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-3">Enlaces</h3>
        <div className="flex flex-wrap gap-4">
          {profile?.github_url && (
            <Button
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={() => window.open(profile.github_url, '_blank')}
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          )}
          {profile?.linkedin_url && (
            <Button
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={() => window.open(profile.linkedin_url, '_blank')}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profile?.location && (
          <div className="flex items-center text-white/70">
            <MapPin className="w-4 h-4 mr-2" />
            {profile.location}
          </div>
        )}
        {profile?.occupation && (
          <div className="flex items-center text-white/70">
            <Briefcase className="w-4 h-4 mr-2" />
            {profile.occupation}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
