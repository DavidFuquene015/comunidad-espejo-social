
import React from 'react';
import { Github, Linkedin, MapPin, Briefcase, Heart, Star, Award, BookOpen, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileInfoProps {
  profile: any;
}

const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'];
  const achievements = [
    { title: 'Primer Proyecto', icon: Award, color: 'text-yellow-400' },
    { title: 'Colaborador Activo', icon: Users, color: 'text-blue-400' },
    { title: 'Mentor Junior', icon: Star, color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* About Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Bio */}
        <Card className="bg-glass-card border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-400" />
              Acerca de mí
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 leading-relaxed">
              {profile?.bio || 'Soy un aprendiz SENA apasionado por la tecnología y el desarrollo de software. Me encanta aprender nuevas tecnologías y colaborar en proyectos innovadores que generen impacto positivo.'}
            </p>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="bg-glass-card border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-green-400" />
              Habilidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-primary/20 text-white hover:bg-primary/30 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="bg-glass-card border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Enlaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {profile?.github_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => window.open(profile.github_url, '_blank')}
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              )}
              {profile?.linkedin_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => window.open(profile.linkedin_url, '_blank')}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Award className="w-4 h-4 mr-2" />
                Portafolio SENA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Info */}
        <Card className="bg-glass-card border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-lg">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile?.location && (
              <div className="flex items-center text-white/80">
                <MapPin className="w-4 h-4 mr-3 text-red-400" />
                <span className="text-sm">{profile.location}</span>
              </div>
            )}
            {profile?.occupation && (
              <div className="flex items-center text-white/80">
                <Briefcase className="w-4 h-4 mr-3 text-blue-400" />
                <span className="text-sm">{profile.occupation}</span>
              </div>
            )}
            <div className="flex items-center text-white/80">
              <BookOpen className="w-4 h-4 mr-3 text-green-400" />
              <span className="text-sm">Aprendiz SENA</span>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-glass-card border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
              Logros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${achievement.color}`} />
                  <span className="text-white/80 text-sm">{achievement.title}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <Card className="bg-glass-card border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-lg">Actividad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Proyectos completados</span>
              <span className="text-white font-semibold">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Cursos en progreso</span>
              <span className="text-white font-semibold">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Horas de estudio</span>
              <span className="text-white font-semibold">120h</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileInfo;
