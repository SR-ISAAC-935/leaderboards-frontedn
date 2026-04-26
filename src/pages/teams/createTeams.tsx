import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button, Container } from "react-bootstrap";
import InscripcionEquipos from "../../Components/inscripcionEquipos";

function CreateMatches() {
    type Equipo = {
        club_name: string,
        estadio: string,
        images: File | null
    }
    const [agregarJornada, setAgregarJornada] = useState(1);
    const [equipos, setequipos] = useState<Equipo[]>([]);

    const onclickAgregarJornada = () => {
        setAgregarJornada(agregarJornada + 1);
    };

    const handleTeamChange = (index: number, data: Equipo) => {
        const nuevos = [...equipos];
        nuevos[index] = data;
        setequipos(nuevos);
    };


    const handleSubmitAllTeams = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        equipos.forEach((equipo, index) => {
            formData.append(`equipos[${index}][club_name]`, equipo.club_name);
            formData.append(`equipos[${index}][estadio]`, equipo.estadio);

            if (equipo.images) {
                formData.append(`equipos[${index}][images]`, equipo.images);
            }
       console.log("Equipos:", equipos);

for (let pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}
        });
        try {
           const token = localStorage.getItem("token");

const response = await fetch('https://apileaderboard.onrender.com/leaderboard/upload-teams', {
  method: 'POST',
  credentials:'include',
  body: formData,
});
            console.log(response)
            const data = await response.json();
            console.log(data)
            if (response.ok) {
                toast.success(data.message);
            }
            else {
                toast.error(data.message || 'error al subir los equipos');
            }
        } catch (error) {
            toast.error('Error de conexión con el servidor');
        }
    };

    return (
        <div>
            <h1>Create Match</h1>

            <Container>
                <Button variant="primary" onClick={onclickAgregarJornada}>
                    Agregar más equipos
                </Button>

                <form onSubmit={handleSubmitAllTeams} className="forTeams">
                    <h2>Listado de equipos</h2>

                    <Button type="submit" className="mb-3">
                        Guardar todos los equipos
                    </Button>

                    {Array.from({ length: agregarJornada }).map((_, i) => (
                        <InscripcionEquipos
                            key={i}
                            data={
                                equipos[i] || {
                                    club_name: "",
                                    estadio: "",
                                    images: null
                                }
                            }
                            onChange={(data: Equipo) => handleTeamChange(i, data)}
                        />
                    ))}
                </form>
            </Container>
        </div>
    );
}

export default CreateMatches;