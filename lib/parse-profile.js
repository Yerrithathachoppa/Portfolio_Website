import fs from 'fs';

/**
 * Parses the markdown format of profile.md into structured JavaScript objects.
 * 
 * @param {string} filePath - Absolute path to profile.md
 * @returns {object} Parsed database data structure
 */
export function parseProfileMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  const data = {
    profile: {
      name: '',
      title: '',
      location: '',
      email: '',
      linkedin_url: '',
      github_url: '',
      bio: '',
      photo_url: null,
      resume_url: null
    },
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    faq: []
  };

  let currentSection = null;
  let currentSubSection = null;
  let currentExperience = null;
  let currentProject = null;
  
  let experienceCount = 0;
  let projectCount = 0;
  let skillCount = 0;
  let faqCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for main section headers (## Heading)
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim().toLowerCase();
      if (sectionName.includes('personal info')) {
        currentSection = 'personal_info';
      } else if (sectionName.includes('experience')) {
        currentSection = 'experience';
        if (currentExperience) {
          data.experience.push(currentExperience);
          currentExperience = null;
        }
      } else if (sectionName.includes('projects')) {
        currentSection = 'projects';
        if (currentProject) {
          data.projects.push(currentProject);
          currentProject = null;
        }
      } else if (sectionName.includes('skills')) {
        currentSection = 'skills';
        currentSubSection = null;
      } else if (sectionName.includes('certifications')) {
        currentSection = 'certifications';
      } else if (sectionName.includes('faq')) {
        currentSection = 'faq';
      } else {
        currentSection = null;
      }
      continue;
    }

    if (currentSection === 'personal_info') {
      const infoMatch = line.match(/^-\s+\*\*([^*]+):\*\*\s*(.*)$/);
      if (infoMatch) {
        const key = infoMatch[1].trim().toLowerCase();
        const value = infoMatch[2].trim();
        if (key === 'name') data.profile.name = value;
        else if (key === 'current title') data.profile.title = value;
        else if (key === 'location') data.profile.location = value;
        else if (key === 'email') data.profile.email = value;
        else if (key === 'linkedin') data.profile.linkedin_url = value;
        else if (key === 'github') data.profile.github_url = value;
        else if (key === 'bio') data.profile.bio = value;
        else if (key === 'resume') data.profile.resume_url = value;
        else if (key === 'photo' || key === 'avatar') data.profile.photo_url = value;
      }
    } else if (currentSection === 'experience') {
      // Look for ### Company Name
      const companyMatch = line.match(/^###\s+(.+)$/);
      if (companyMatch) {
        if (currentExperience) {
          data.experience.push(currentExperience);
        }
        currentExperience = {
          company: companyMatch[1].trim(),
          role: '',
          start_date: '',
          end_date: null,
          bullets: [],
          sort_order: ++experienceCount
        };
        continue;
      }

      // Look for Role and Dates: **Role** | Start Date – End Date
      if (currentExperience && line.startsWith('**')) {
        const roleDateMatch = line.match(/^\*\*([^*]+)\*\*\s*\|\s*(.+)$/);
        if (roleDateMatch) {
          currentExperience.role = roleDateMatch[1].trim();
          const dates = roleDateMatch[2].trim().split(/[–-]/); // split by en-dash or hyphen
          currentExperience.start_date = dates[0].trim();
          if (dates[1]) {
            currentExperience.end_date = dates[1].trim();
          }
        }
        continue;
      }

      // Look for experience bullets
      if (currentExperience && line.startsWith('-')) {
        const bulletContent = line.substring(1).trim();
        currentExperience.bullets.push(bulletContent);
      }
    } else if (currentSection === 'projects') {
      // Look for ### Project Name
      const projectTitleMatch = line.match(/^###\s+(.+)$/);
      if (projectTitleMatch) {
        if (currentProject) {
          data.projects.push(currentProject);
        }
        currentProject = {
          title: projectTitleMatch[1].trim(),
          description: '',
          tech: [],
          thumbnail_url: null,
          video_url: null,
          project_url: null,
          sort_order: ++projectCount
        };
        continue;
      }

      if (currentProject && line.startsWith('-')) {
        const detailMatch = line.match(/^-\s+\*\*([^*]+):\*\*\s*(.*)$/);
        if (detailMatch) {
          const key = detailMatch[1].trim().toLowerCase();
          const value = detailMatch[2].trim();
          if (key === 'description') {
            currentProject.description = value;
          } else if (key === 'tech') {
            currentProject.tech = value.split(',').map(t => t.trim());
          } else if (key === 'link') {
            currentProject.project_url = value;
          } else if (key === 'github') {
            currentProject.video_url = value;
          } else if (key === 'thumbnail' || key === 'thumbnail_url' || key === 'image') {
            currentProject.thumbnail_url = value;
          }
        }
      }
    } else if (currentSection === 'skills') {
      // Look for category subheaders (### Technical, etc.)
      const categoryMatch = line.match(/^###\s+(.+)$/);
      if (categoryMatch) {
        const catName = categoryMatch[1].trim().toLowerCase();
        if (catName.includes('technical')) {
          currentSubSection = 'technical';
        } else if (catName.includes('tools')) {
          currentSubSection = 'tools';
        } else if (catName.includes('soft')) {
          currentSubSection = 'soft';
        } else {
          currentSubSection = null;
        }
        continue;
      }

      // Look for skill item
      if (currentSubSection && line.startsWith('-')) {
        const skillName = line.substring(1).trim();
        data.skills.push({
          category: currentSubSection,
          name: skillName,
          sort_order: ++skillCount
        });
      }
    } else if (currentSection === 'faq') {
      // Look for Q: and A:
      const qMatch = line.match(/^\*\*Q:\s*(.*?)\*\*$/i);
      const aMatch = line.match(/^\*\*A:\*\*\s*(.*)$/i);

      if (qMatch) {
        data.faq.push({
          question: qMatch[1].trim(),
          answer: '',
          sort_order: ++faqCount
        });
      } else if (aMatch && data.faq.length > 0) {
        data.faq[data.faq.length - 1].answer = aMatch[1].trim();
      } else if (data.faq.length > 0 && !line.startsWith('**Q:')) {
        const lastFaq = data.faq[data.faq.length - 1];
        if (lastFaq.answer) {
          lastFaq.answer += ' ' + line;
        } else {
          lastFaq.answer = line;
        }
      }
    } else if (currentSection === 'certifications') {
      const certMatch = line.match(/^-\s+\*\*([^*]+):\*\*\s*(.*)$/);
      if (certMatch) {
        const certName = certMatch[1].trim();
        const certUrl = certMatch[2].trim();
        data.certifications.push({
          name: certName,
          url: certUrl,
          sort_order: data.certifications.length + 1
        });
      }
    }
  }

  // Push the final items
  if (currentExperience) {
    data.experience.push(currentExperience);
  }
  if (currentProject) {
    data.projects.push(currentProject);
  }

  return data;
}
