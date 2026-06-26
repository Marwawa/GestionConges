namespace backend.Services;

public static class JoursFeriesMarocService
{
    private static readonly Dictionary<int, DateOnly[]> JoursReligieuxParAnnee = new()
    {
        [2026] =
        [
            new DateOnly(2026, 3, 20),
            new DateOnly(2026, 3, 21),
            new DateOnly(2026, 5, 27),
            new DateOnly(2026, 5, 28),
            new DateOnly(2026, 8, 25),
            new DateOnly(2026, 8, 26),
        ],
        [2027] =
        [
            new DateOnly(2027, 3, 9),
            new DateOnly(2027, 3, 10),
            new DateOnly(2027, 5, 17),
            new DateOnly(2027, 5, 18),
            new DateOnly(2027, 8, 14),
            new DateOnly(2027, 8, 15),
        ],
        [2028] =
        [
            new DateOnly(2028, 2, 26),
            new DateOnly(2028, 2, 27),
            new DateOnly(2028, 5, 5),
            new DateOnly(2028, 5, 6),
            new DateOnly(2028, 8, 2),
            new DateOnly(2028, 8, 3),
        ],
    };

    public static IReadOnlyCollection<DateOnly> GetJoursFeries(int annee)
    {
        var jours = new HashSet<DateOnly>
        {
            new(annee, 1, 1),
            new(annee, 1, 11),
            new(annee, 1, 14),
            new(annee, 5, 1),
            new(annee, 7, 30),
            new(annee, 8, 14),
            new(annee, 8, 20),
            new(annee, 8, 21),
            new(annee, 11, 6),
            new(annee, 11, 18),
        };

        if (JoursReligieuxParAnnee.TryGetValue(annee, out var joursReligieux))
        {
            foreach (var jour in joursReligieux)
            {
                jours.Add(jour);
            }
        }

        return jours;
    }

    public static bool EstJourOuvrable(DateOnly date)
    {
        return date.DayOfWeek is not DayOfWeek.Saturday and not DayOfWeek.Sunday
            && !GetJoursFeries(date.Year).Contains(date);
    }

    public static int CalculerJoursOuvrables(DateOnly debut, DateOnly fin)
    {
        var jours = 0;
        for (var current = debut; current <= fin; current = current.AddDays(1))
        {
            if (EstJourOuvrable(current))
            {
                jours++;
            }
        }

        return jours;
    }
}
